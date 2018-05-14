const helper = require('./helper');

/**
 * permission is a separate helper because it uses
 * cache to obtain and verify permission
 */
const Access = {
  test: 1,
  isRank: (auth, checkRank = 'adm') => {
    const rank = auth.claims['custom:rank'];
    return (rank && rank === checkRank);
  },
  canAccessProject: async (auth, pid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true};
    }
    const rst = {read: false, write: false};
    const storage = helper.getStorage('s3', 'projects');
    const userAttr = await storage.specialAttr(pid, 'users');
    const {email} = auth.claims.email;

    if (userAttr[email] === 'admin') {
      rst.read = true;
      rst.write = true;
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    const teamAttr = await storage.specialAttr(pid, 'teams');
    if (teamAttr[email] === 'admin') {
      rst.read = true;
      rst.write = true;
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    return rst;
  },
  canAccessModule: async (auth, pid, mid) => {
    const rst = this.canAccessProject(auth, pid);
    const storage = helper.getStorage('s3', 'projects');
    const userAttr = await storage.specialAttr(pid, `${mid}/users`, '');
    const {email} = auth.claims.email;

    if (userAttr[email] === 'admin') {
      rst.read = true;
      rst.write = true;
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    const teamAttr = await storage.specialAttr(pid, `${mid}/users`, '');
    if (teamAttr[email] === 'admin') {
      rst.read = true;
      rst.write = true;
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    if (userAttr[email] === 'deny' || teamAttr[email] === 'deny') {
      rst.read = false;
      rst.write = false;
    }

    return rst;
  },
  canAccessTeam: async (auth, tid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true};
    }

    const rst = {read: false, write: false};
    const storage = helper.getStorage('s3', 'teams');
    const userAttr = await storage.specialAttr(tid, 'users');
    const {email} = auth.claims.email;

    if (userAttr[email] === 'admin') {
      rst.read = true;
      rst.write = true;
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    if (userAttr[email] === 'deny') {
      rst.read = false;
      rst.write = false;
    }

    return rst;
  }
};

module.exports = Access;
