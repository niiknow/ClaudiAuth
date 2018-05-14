const helper = require('./helper');

/**
 * permission is a separate helper because it uses
 * cache to obtain and verify permission
 */
const Access = {
  isRank: (auth, checkRank = 'adm') => {
    const rank = auth.claims['custom:rank'];
    return (rank && rank === checkRank);
  },
  canAccessProject: async (auth, pid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true, acces: 'admin'};
    }
    const rst = {read: false, write: false, access: ''};
    const storage = helper.getStorage('s3', 'projects');
    const userAttr = await storage.specialAttr(pid, 'users');
    const {uid} = auth.claims['custom:uid'];

    if (userAttr[uid] === 'admin') {
      rst.read = true;
      rst.write = true;
      rst.access = 'admin';
    } else if (userAttr[uid] === 'user') {
      rst.read = true;
      rst.access = 'user';
    }

    const teamAttr = await storage.specialAttr(pid, 'teams');
    if (teamAttr[uid] === 'admin') {
      rst.read = true;
      rst.write = true;
      rst.access = 'admin';
    } else if (userAttr[uid] === 'user') {
      rst.read = true;
      rst.access = 'user';
    }

    return rst;
  },
  canAccessModule: async (auth, pid, mid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true, acces: 'admin'};
    }
    const rst = this.canAccessProject(auth, pid);
    const storage = helper.getStorage('s3', 'projects');
    const userAttr = await storage.specialAttr(pid, `${mid}/users`, null, '');
    const {uid} = auth.claims['custom:uid'];

    if (userAttr[uid] === 'admin') {
      rst.read = true;
      rst.write = true;
      rst.access = 'admin';
    } else if (userAttr[uid] === 'user') {
      rst.read = true;
      rst.access = 'user';
    }

    const teamAttr = await storage.specialAttr(pid, `${mid}/users`, null, '');
    if (teamAttr[uid] === 'admin') {
      rst.read = true;
      rst.write = true;
      rst.access = 'admin';
    } else if (userAttr[uid] === 'user') {
      rst.read = true;
      rst.access = 'user';
    }

    if (userAttr[uid] === 'deny' || teamAttr[uid] === 'deny') {
      rst.read = false;
      rst.write = false;
      rst.access = 'user';
    }

    return rst;
  },
  canAccessTeam: async (auth, tid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true, acces: 'admin'};
    }

    const rst = {read: false, write: false};
    const storage = helper.getStorage('s3', 'teams');
    const userAttr = await storage.specialAttr(tid, 'users');
    const {uid} = auth.claims['custom:uid'];

    if (userAttr[uid] === 'admin') {
      rst.read = true;
      rst.write = true;
      rst.access = 'admin';
    } else if (userAttr[uid] === 'user') {
      rst.read = true;
      rst.access = 'user';
    }

    if (userAttr[uid] === 'deny') {
      rst.read = false;
      rst.write = false;
      rst.access = 'deny';
    }

    return rst;
  }
};

module.exports = Access;
