export const schema = {
  project_id: "fe8af65a-bcdf-49c1-9e22-3624e0506558",
  version: 3,
  tables: {
    friends: {
      type: "collection",
      fields: {
        city: {
          type: "string",
          indexed: true
        },
        name: {
          type: "string",
          indexed: true
        },
        email: {
          type: "string",
          indexed: true
        },
        source: {
          type: "string",
          indexed: true
        },
        isLocal: {
          type: "boolean",
          indexed: true
        },
        isOnline: {
          type: "boolean",
          indexed: true
        },
        createdAt: {
          type: "number",
          indexed: true
        },
        friendType: {
          type: "string",
          indexed: true
        },
        profilePicture: {
          type: "string",
          indexed: true
        },
        notificationDays: {
          type: "number",
          indexed: true
        },
        notificationFrequency: {
          type: "string",
          indexed: true
        }
      }
    },
    meetings: {
      type: "collection",
      fields: {
        date: {
          type: "string",
          indexed: true
        },
        notes: {
          type: "string",
          indexed: true
        },
        venue: {
          type: "string",
          indexed: true
        },
        activity: {
          type: "string",
          indexed: true
        },
        friendId: {
          type: "string",
          indexed: true
        },
        createdAt: {
          type: "number",
          indexed: true
        },
        city: {
          type: "string",
          indexed: true
        },
        status: {
          type: "string",
          indexed: true
        }
      }
    },
    friendshipMemos: {
      type: "collection",
      fields: {
        memo: {
          type: "string",
          indexed: true
        },
        year: {
          type: "number",
          indexed: true
        },
        friendId: {
          type: "string",
          indexed: true
        },
        createdAt: {
          type: "number",
          indexed: true
        }
      }
    }
  }
} as const;