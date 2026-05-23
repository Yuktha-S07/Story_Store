from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

c=MongoClient('mongodb://localhost:27017')
db=c['story_store']
_id=ObjectId('6a10999ea27139d607ec4f7a')
print('before', db.stories.find_one({'_id': _id})['title'])
res=db.stories.update_one({'_id': _id}, {'$set': {'title':'When Stars Remember','description':'A short, poetic tale about memory and maps','updated_at': datetime.utcnow()}})
print('matched', res.matched_count, 'modified', res.modified_count)
print('after', db.stories.find_one({'_id': _id})['title'])
