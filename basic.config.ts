export const schema = {
  "tables": {
    "friends": {
      "type": "collection",
      "fields": {
        "name": {
          "type": "string",
          "indexed": true
        },
        "email": {
          "type": "string",
          "indexed": true
        },
        "friendType": {
          "type": "string",
          "indexed": true
        },
        "isOnline": {
          "type": "boolean",
          "indexed": true
        },
        "isLocal": {
          "type": "boolean",
          "indexed": true
        },
        "profilePicture": {
          "type": "string",
          "indexed": true
        },
        "city": {
          "type": "string",
          "indexed": true
        },
        "source": {
          "type": "string",
          "indexed": true
        },
        "notificationFrequency": {
          "type": "string",
          "indexed": true
        },
        "notificationDays": {
          "type": "number",
          "indexed": true
        },
        "createdAt": {
          "type": "number",
          "indexed": true
        }
      }
    },
    "meetings": {
      "type": "collection",
      "fields": {
        "friendId": {
          "type": "string",
          "indexed": true
        },
        "date": {
          "type": "string",
          "indexed": true
        },
        "activity": {
          "type": "string",
          "indexed": true
        },
        "venue": {
          "type": "string",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        },
        "createdAt": {
          "type": "number",
          "indexed": true
        }
      }
    },
    "friendshipMemos": {
      "type": "collection",
      "fields": {
        "friendId": {
          "type": "string",
          "indexed": true
        },
        "year": {
          "type": "number",
          "indexed": true
        },
        "memo": {
          "type": "string",
          "indexed": true
        },
        "createdAt": {
          "type": "number",
          "indexed": true
        }
      }
    }
  },
  "version": 1,
  "project_id": "fe8af65a-bcdf-49c1-9e22-3624e0506558"
};