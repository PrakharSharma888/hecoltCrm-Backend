const store = {
  users: [
    {
      id: "1",
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123", // In real app, this would be hashed
      avatar: "https://i.pravatar.cc/150?u=jane",
    },
  ],
  clients: [
    {
      id: "101",
      name: "Global Tech",
      email: "contact@globaltech.com",
      status: "Active",
      joined: "2023-01-15",
    },
    {
      id: "102",
      name: "BlueSky Marketing",
      email: "info@bluesky.com",
      status: "Active",
      joined: "2023-02-20",
    },
  ],
  tasks: [
    {
      id: 1,
      client: "Global Tech",
      title: "Campaign Strategy",
      date: "Oct 24",
      assigneeImg: "https://i.pravatar.cc/150?u=1",
      status: "todo", // todo, inProgress, underReview, completed
    },
    {
      id: 2,
      client: "Designing",
      title: "Brand Refresh",
      date: "Oct 22",
      progress: 66,
      assigneeImg: "https://i.pravatar.cc/150?u=2",
      status: "inProgress",
    },
  ],
  activities: [
    {
      id: 1,
      user: "Sarah Jenkins",
      action: "moved",
      target: "Homepage Redesign",
      status: "Done",
      time: "2 hours ago",
      project: "BlueSky Marketing",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      isSystem: false,
    },
    {
      id: 2,
      user: "System",
      content: "New Client Onboarded",
      time: "Yesterday",
      isSystem: true,
    },
  ],
};

module.exports = store;
