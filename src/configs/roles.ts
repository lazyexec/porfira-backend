interface RoleRights {
  [key: string]: string[];
}

const allRoles: RoleRights = {
  student: ["common", "student"],
  teacher: ["common", "teacher"],
  admin: ["common", "admin"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));
export { roles, roleRights };