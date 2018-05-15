const helper = require('./helper');

/**
 * permission is a separate helper because it uses
 * cache to obtain and verify permission
 */
class AccessHelper {
  isRank(auth, ranks = ['adm']) {
    auth = auth.claims ? auth : auth.context.authorizer;

    const rank = auth.claims['custom:rank'] || '';

    if (typeof ranks === 'string' || ranks instanceof String) {
      ranks = [ranks];
    }

    return ranks.indexOf(rank) >= 0;
  }

  async canAccessProject(auth, pid) {
    auth = auth.claims ? auth : auth.context.authorizer;

    if (this.isRank(auth, ['adm'])) {
      return {read: true, write: true, access: 'admin'};
    } else if (this.isRank(auth, ['', 'deny'])) {
      return {read: false, write: false, access: 'deny'}
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
  }

  async canAccessModule(auth, pid, mid) {
    auth = auth.claims ? auth : auth.context.authorizer;

    if (this.isRank(auth, ['adm'])) {
      return {read: true, write: true, access: 'admin'};
    } else if (this.isRank(auth, ['', 'deny'])) {
      return {read: false, write: false, access: 'deny'}
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
  }

  async canAccessTeam(auth, tid) {
    auth = auth.claims ? auth : auth.context.authorizer;

    if (this.isRank(auth, ['adm'])) {
      return {read: true, write: true, access: 'admin'};
    } else if (this.isRank(auth, ['', 'deny'])) {
      return {read: false, write: false, access: 'deny'}
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
}

const access = new AccessHelper();

module.exports = access;
