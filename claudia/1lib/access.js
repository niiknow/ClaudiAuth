const CacheManager = require('cache-manager');
const Helper = require('./helper');
const HelperS3 = require('./helpers3');

/**
 * permission is a separate helper because it uses
 * cache to obtain and verify permission
 */
const Access = {
  isRank: (auth, checkRank = 'adm') => {
    const rank = auth.claims['custom:rank'];
    return (rank && rank === checkRank);
  },
  canAccessProject: (auth, pid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true};
    }
    const rst = {read: false, write: false};
    const storage = helper.getStorage('s3', 'projects');
    const userAttr = storage.specialAttr(tid, 'users');
    const email = auth.claims['email'];

    if (userAttr[email] === 'admin') {
      return {read: true, write: true};
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    const teamAttr = storage.specialAttr(pid, 'teams');
    if (teamAttr[email] === 'admin') {
      return {read: true, write: true};
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    return rst;
  },
  canAccessModule: (auth, pid, mname, mid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true};
    }
    const rst = {read: false, write: false};
    const storage = helper.getStorage('s3', mname);
    const userAttr = storage.specialAttr(mid, `${pid}/users`, '');
    const email = auth.claims['email'];

    if (userAttr[email] === 'admin') {
      return {read: true, write: true};
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    const teamAttr = storage.specialAttr(mid, `${pid}/teams`, '');
    if (teamAttr[email] === 'admin') {
      return {read: true, write: true};
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    return rst;
  },
  canAccessTeam: (auth, tid) => {
    if (this.isRank(auth, 'adm')) {
      return {read: true, write: true};
    }

    const rst = {read: false, write: false};
    const storage = helper.getStorage('s3', 'teams');
    const userAttr = storage.specialAttr(tid, 'users');
    const email = auth.claims['email'];

    if (userAttr[email] === 'admin') {
      return {read: true, write: true};
    } else if (userAttr[email] === 'user') {
      rst.read = true;
    }

    return rst;
  }
};

module.exports = Access;
