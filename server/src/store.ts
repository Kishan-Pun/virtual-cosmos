// store.ts

type User = {
  x: number;
  y: number;
};

const users: Record<string, User> = {};

export const addUser = (id: string) => {
  users[id] = { x: 300, y: 300 };
};

export const removeUser = (id: string) => {
  delete users[id];
};

export const updateUser = (id: string, pos: User) => {
  users[id] = pos;
};

export const getUsers = () => users;