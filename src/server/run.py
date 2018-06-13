#!/usr/local/anaconda/bin/python
import os
import os.path as path
import sys
import time

import numpy as np
from sanic import Sanic
from sanic import response
from sklearn.linear_model import LogisticRegression
from sqlitedict import SqliteDict

BASE_FEATURE_TYPES = ['inception_v3', 'nasnet_large']
FEATURE_TYPE_ADDENDA = {'-svd_1024': [4, 8, 16, 32, 64, 128, 256, 512]}
DEFAULT_FEATURE_TYPE = 'inception_v3-svd_1024'


class TagsData(object):
    _tags_db_path = './src/server/tags.sqlite'

    def __init__(self, db_path=_tags_db_path):
        self._tags_db = SqliteDict(db_path, tablename='tags', autocommit=True)
        self._metadata = self.compute_metadata()

    def compute_metadata(self):
        res = []
        for tag_user, data in self._tags_db.items():
            tag, user = tag_user.split(':')
            num_tagged = len(data['pos']) + len(data['neg']) + len(data['unk'])
            res.append({'tag': tag, 'num': num_tagged, 'user': user})
        res.sort(key=lambda item: item['num'], reverse=True)
        return res

    def get_metadata(self):
        return self._metadata

    def get_data(self, tag, user):
        tag_user = tag + ':' + user
        if tag_user in self._tags_db:
            return self._tags_db[tag_user]
        return {'pos': [], 'neg': [], 'unk': []}

    def save_data(self, tag, user, pos, neg, unk):
        tag_user = tag + ':' + user
        self._tags_db[tag_user] = {'pos': pos, 'neg': neg, 'unk': unk}
        # recompute metadata.
        # This could be done more efficiently with an incremental update
        self._metadata = self.compute_metadata()


class ServerData(object):
    _base_dir = './public/photos'

    def __init__(self):
        self._collection_ids = ['unsplash']
        image_dir = path.join(self._base_dir, '128x128')
        unsplash_image_ids = [fn[:-4] for fn in os.listdir(image_dir) if fn.endswith(".jpg")]
        unsplash_image_ids.sort()
        self._image_ids = {'unsplash': unsplash_image_ids}
        self._generate_image_id2idx()

        self._image_features = {}
        for ft in BASE_FEATURE_TYPES:
            # self._load_features(ft, 'unsplash')
            for addendum in FEATURE_TYPE_ADDENDA:
                self._load_features(ft, 'unsplash', addendum)

    def _load_features(self, base_feature_type, collection_id, addendum=''):
        assert collection_id == 'unsplash'
        image_ids = self._image_ids[collection_id]
        file_name = 'all' + addendum + '.npy'
        features_path = path.join(self._base_dir, 'feature_vectors', base_feature_type, file_name)
        features = np.load(features_path).astype(np.float64, order='C')
        feature_type = base_feature_type + addendum
        if feature_type not in self._image_features:
            self._image_features[feature_type] = {}
        self._image_features[feature_type][collection_id] = features

    def _generate_image_id2idx(self):
        self._image_id2idx = {}
        for coll, img_ids in self._image_ids.items():
            self._image_id2idx[coll] = {img_id: i for i, img_id in enumerate(img_ids)}

    def get_collection_ids(self):
        return self._collection_ids

    def get_image_ids(self, collection_id):
        return self._image_ids[collection_id]

    def get_feature_types(self):
        res = {}
        res['all'] = list(self._image_features.keys())
        res['active'] = DEFAULT_FEATURE_TYPE
        return res

    def get_features(self, feature_type, collection_id, max_dims, ids=None):
        features = self._image_features[feature_type][collection_id]
        if max_dims:
            features = features[:, :max_dims]
        if ids is None:
            return features
        else:
            idxs = [self._image_id2idx[collection_id][img_id] for img_id in ids]
            return features[idxs, :]

    def calculate_probs(self, pos_ids, neg_ids, coll_id, feature_type, max_dims):
        coll_features = self.get_features(feature_type, coll_id, max_dims)

        if len(neg_ids) == 0:
            assert len(pos_ids) > 0
            pos_features = self.get_features(feature_type, coll_id, max_dims, ids=pos_ids)
            probs = self.nearest_neighbor_probs(pos_features, coll_features)

        elif len(pos_ids) == 0:
            assert len(neg_ids) > 0
            neg_features = self.get_features(feature_type, coll_id, max_dims, ids=neg_ids)
            probs = 1 - self.nearest_neighbor_probs(neg_features, coll_features)

        else:
            pos_features = self.get_features(feature_type, coll_id, max_dims, ids=pos_ids)
            neg_features = self.get_features(feature_type, coll_id, max_dims, ids=neg_ids)
            probs = self.classifier_probs(pos_features, neg_features, coll_features)

        assert np.isfinite(probs).all()
        return probs

    def nearest_neighbor_probs(self, target_features, coll_features):
        mean_target_features = np.mean(target_features, axis=0)
        sq_dists = np.sum(np.square(coll_features - mean_target_features), axis=1)
        normalized_neg_sq_dists = -0.5 * (sq_dists / np.mean(sq_dists))
        probs = np.exp(normalized_neg_sq_dists)
        return probs

    def classifier_probs(self, pos_features, neg_features, coll_features):
        model = LogisticRegression(class_weight='balanced')
        num_pos = pos_features.shape[0]
        num_neg = neg_features.shape[0]
        X_train = np.concatenate((pos_features, neg_features))
        y_train = np.concatenate((np.ones((num_pos, )), np.zeros((num_neg, ))))
        model.fit(X_train, y_train)
        probs = model.predict_proba(coll_features)[:, 1]
        return probs


if __name__ == '__main__':
    server_data = ServerData()
    tags_data = TagsData()
    app = Sanic(__name__)

    @app.route('/api/tags-metadata')
    async def get_tags_metadata(request):
        return response.json(tags_data.get_metadata())

    @app.route('/api/tags/<tag>/<user>')
    async def get_tags_data(request, tag, user):
        return response.json(tags_data.get_data(tag, user))

    @app.route('/api/tags/<tag>/<user>', methods=['POST'])
    async def save_tags(request, tag, user):
        pos_ids = request.json['pos']
        neg_ids = request.json['neg']
        unk_ids = request.json['unk']
        tags_data.save_data(tag, user, pos_ids, neg_ids, unk_ids)
        return response.text('ok')

    @app.route('/api/collections/<name>')
    async def get_collection_data(request, name):
        return response.json(server_data.get_image_ids(name))

    @app.route('/api/feature-types')
    async def get_feature_types(request):
        feature_types = server_data.get_feature_types()
        additional = []
        for ft in feature_types['all']:
            for addendum in FEATURE_TYPE_ADDENDA:
                if ft.endswith(addendum):
                    for max_dim in FEATURE_TYPE_ADDENDA[addendum]:
                        additional.append(ft + '-max=' + str(max_dim))
        feature_types['all'] += additional
        return response.json(feature_types)

    @app.route('/api/classify/', methods=['POST'])
    async def classify_images(request):
        pos_ids = request.json['pos']
        neg_ids = request.json['neg']
        coll_id = request.json['collectionId']
        feature_type = request.json['featureType']
        max_dims = None
        if 'maxDims' in request.json:
            max_dims = int(request.json['maxDims'])
        elif '-' in feature_type:
            fields = feature_type.split('-')
            if fields[-1].startswith('max='):
                max_dims = int(fields[-1][4:])
                feature_type = '-'.join(fields[:-1])

        probs = server_data.calculate_probs(pos_ids, neg_ids, coll_id, feature_type, max_dims)
        return response.json(probs)

    app.run(host="0.0.0.0", port=3001, debug=True)
