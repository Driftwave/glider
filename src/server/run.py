#!/usr/local/anaconda/bin/python
import os
import sys

import numpy as np
from sanic import Sanic
from sanic import response
from sklearn.linear_model import LogisticRegression
import ujson


class ServerData(object):
    _base_dir = '/Users/bsnyder/src/unsplash-data/photos'

    def __init__(self):
        self._collection_ids = ['unsplash']

        unsplash_image_ids = [
            fn[:-4] for fn in os.listdir(self._base_dir) if fn.endswith(".jpg")
        ]
        self._image_ids = {'unsplash': unsplash_image_ids}
        self._generate_image_id2idx()

        self._weight_types = os.listdir(
            os.path.join(self._base_dir, 'weights'))
        self._image_weights = {wt: {} for wt in self._weight_types}
        for wt in self._weight_types:
            ws = []
            for img_id in self._image_ids['unsplash']:
                w = np.load(
                    os.path.join(self._base_dir, 'weights', wt,
                                 img_id + '.npy'))
                ws.append(w.reshape(1, w.size))
            self._image_weights[wt]['unsplash'] = np.concatenate(ws)

    def _generate_image_id2idx(self):
        self._image_id2idx = {}
        for coll, img_ids in self._image_ids.items():
            self._image_id2idx[coll] = {
                img_id: i
                for i, img_id in enumerate(img_ids)
            }

    def get_collection_ids(self):
        return self._collection_ids

    def get_image_ids(self, collection_id):
        return self._image_ids[collection_id]

    def get_weight_types(self):
        return self._weight_types

    def get_weights(self, weight_type, collection_id, image_ids=None):
        weights = self._image_weights[weight_type][collection_id]
        if image_ids is None:
            return weights
        else:
            idxs = [
                self._image_id2idx[collection_id][img_id]
                for img_id in image_ids
            ]
            return weights[idxs, :]


def calculate_probs(pos_ids, neg_ids, coll_id):
    coll_weights = data.get_weights(DEFAULT_WEIGHT_TYPE, coll_id)

    if len(neg_ids) == 0:
        assert len(pos_ids) > 0
        pos_weights = data.get_weights(
            DEFAULT_WEIGHT_TYPE, coll_id, image_ids=pos_ids)
        probs = nearest_neighbor_probs(pos_weights, coll_weights)

    elif len(pos_ids) == 0:
        assert len(neg_ids) > 0
        neg_weights = data.get_weights(
            DEFAULT_WEIGHT_TYPE, coll_id, image_ids=neg_ids)
        probs = 1 - nearest_neighbor_probs(neg_weights, coll_weights)

    else:
        pos_weights = data.get_weights(
            DEFAULT_WEIGHT_TYPE, coll_id, image_ids=pos_ids)
        neg_weights = data.get_weights(
            DEFAULT_WEIGHT_TYPE, coll_id, image_ids=neg_ids)
        probs = classifier_probs(pos_weights, neg_weights, coll_weights)

    assert np.isfinite(probs).all()
    return probs


def nearest_neighbor_probs(targets, data):
    target = np.mean(targets, axis=0)
    sq_dists = np.sum(np.square(data - target), axis=1)
    normalized_neg_sq_dists = -(sq_dists / np.mean(sq_dists))
    exp_neg_sq_dists = np.exp(normalized_neg_sq_dists)
    probs = exp_neg_sq_dists
    return probs


def classifier_probs(pos_weights, neg_weights, test_weights):
    model = LogisticRegression()
    num_pos = pos_weights.shape[0]
    num_neg = neg_weights.shape[0]
    X_train = np.concatenate((pos_weights, neg_weights))
    y_train = np.concatenate((np.ones((num_pos, )), np.zeros((num_neg, ))))
    model.fit(X_train, y_train)
    probs = model.predict_proba(test_weights)[:, 1]
    return probs


DEFAULT_WEIGHT_TYPE = "inception_v3-bottleneck"

app = Sanic(__name__)
data = ServerData()


@app.route('/api/collections/<name>')
async def collection_handler(request, name):
    return response.json(data.get_image_ids(name))


@app.route('/api/classify', methods=['POST'])
async def classify_handler(request):
    pos_ids = request.json['pos']
    neg_ids = request.json['neg']
    coll_id = request.json['collectionId']

    probs = calculate_probs(pos_ids, neg_ids, coll_id)
    return response.json(probs.astype(np.float64))


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == "test":
        probs = calculate_probs(["O_uHS1bru2k"], [], "unsplash")

    else:
        app.run(host="0.0.0.0", port=3001, debug=True)