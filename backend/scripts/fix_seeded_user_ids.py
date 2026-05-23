from pymongo import MongoClient
from bson import ObjectId

c = MongoClient('mongodb://localhost:27017')
db = c['story_store']
new_user = ObjectId('6a0aa3eaeed8949f9e467226')
count = 0
for s in db.stories.find():
    uid = s.get('user_id')
    if isinstance(uid, str):
        print('updating', s.get('title'), 'from', uid)
        db.stories.update_one({'_id': s['_id']}, {'$set': {'user_id': new_user}})
        count += 1
print('done', count)
