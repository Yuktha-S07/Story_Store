from pymongo import MongoClient
from datetime import datetime

c=MongoClient('mongodb://localhost:27017')
db=c['story_store']
small=[]
for s in db.stories.find():
    t=s.get('title','')
    if len(t.strip())<4 or t.strip().isdigit():
        small.append(s)
print('to fix', len(small))
for i,s in enumerate(small, start=1):
    new='A Thread Between Two Cities' if i==1 else f'Tale of the Quiet {i}'
    print('updating', s.get('title'), '->', new)
    db.stories.update_one({'_id': s['_id']},{'$set':{'title':new,'updated_at':datetime.utcnow()}})
print('done')
