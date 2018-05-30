#!/usr/local/anaconda/bin/python
import os
import os.path as path
import sys

import numpy as np
from sanic import Sanic
from sanic import response
from sklearn.linear_model import LogisticRegression

FEATURE_TYPES = ['inception_v3', 'nasnet_large']


class ServerData(object):
    _base_dir = './public/photos'

    def __init__(self):
        self._collection_ids = ['unsplash']

        image_dir = path.join(self._base_dir, '128x128')
        unsplash_image_ids = [fn[:-4] for fn in os.listdir(image_dir) if fn.endswith(".jpg")]
        self._image_ids = {'unsplash': unsplash_image_ids}
        self._generate_image_id2idx()

        self._feature_types = FEATURE_TYPES
        self._image_features = {ft: {} for ft in self._feature_types}
        for ft in self._feature_types:
            self._load_features(ft, 'unsplash')

    def _load_features(self, feature_type, collection_id):
        assert collection_id == 'unsplash'
        image_ids = self._image_ids[collection_id]
        features_path = path.join(self._base_dir, 'feature_vectors', feature_type, 'all.npy')
        features = np.load(features_path)
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
        return self._feature_types

    def get_features(self, feature_type, collection_id, image_ids=None):
        features = self._image_features[feature_type][collection_id]
        if image_ids is None:
            return features
        else:
            idxs = [self._image_id2idx[collection_id][img_id] for img_id in image_ids]
            return features[idxs, :]


def calculate_probs(pos_ids, neg_ids, coll_id, feature_type):
    coll_features = data.get_features(feature_type, coll_id)

    if len(neg_ids) == 0:
        assert len(pos_ids) > 0
        pos_features = data.get_features(feature_type, coll_id, image_ids=pos_ids)
        probs = nearest_neighbor_probs(pos_features, coll_features)

    elif len(pos_ids) == 0:
        assert len(neg_ids) > 0
        neg_features = data.get_features(feature_type, coll_id, image_ids=neg_ids)
        probs = 1 - nearest_neighbor_probs(neg_features, coll_features)

    else:
        pos_features = data.get_features(feature_type, coll_id, image_ids=pos_ids)
        neg_features = data.get_features(feature_type, coll_id, image_ids=neg_ids)
        probs = classifier_probs(pos_features, neg_features, coll_features)

    assert np.isfinite(probs).all()
    return probs


def nearest_neighbor_probs(targets, data):
    target = np.mean(targets, axis=0)
    sq_dists = np.sum(np.square(data - target), axis=1)
    normalized_neg_sq_dists = -0.5 * (sq_dists / np.mean(sq_dists))
    probs = np.exp(normalized_neg_sq_dists)
    return probs


def classifier_probs(pos_features, neg_features, test_features):
    model = LogisticRegression()
    num_pos = pos_features.shape[0]
    num_neg = neg_features.shape[0]
    X_train = np.concatenate((pos_features, neg_features))
    y_train = np.concatenate((np.ones((num_pos, )), np.zeros((num_neg, ))))
    model.fit(X_train, y_train)
    probs = model.predict_proba(test_features)[:, 1]
    return probs


app = Sanic(__name__)
data = ServerData()


@app.route('/api/collections/<name>')
async def collection_handler(request, name):
    return response.json(data.get_image_ids(name))


@app.route('/api/classify/', methods=['POST'])
async def classify_handler(request):
    pos_ids = request.json['pos']
    neg_ids = request.json['neg']
    coll_id = request.json['collectionId']
    feature_type = request.json['featureType']

    probs = calculate_probs(pos_ids, neg_ids, coll_id, feature_type)
    return response.json(probs.astype(np.float64))


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == "test":
        probs = calculate_probs(["O_uHS1bru2k"], [], "unsplash")

    else:
        app.run(host="0.0.0.0", port=3001, debug=True)
