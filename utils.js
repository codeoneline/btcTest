
const crypto = require('crypto')


function getHash(id, user) {
  console.log("getHash id = %s",id)
  console.log("getHash user = %s", user)
  if (!id.startsWith('0x')) {
      id = '0x' + id;
  }
  if (!user.startsWith('0x')) {
      user = '0x' + user;
  }
  const hash = crypto.createHash('sha256');
  hash.update(id + user);
  let ret = hash.digest('hex');
  console.log('getHash id = %s user=%s hash(id,user)', id, user, ret);
  if (ret.startsWith('0x')) {
      ret = ret.slice(2);
  }
  return ret;
}

module.exports = {
  getHash,
}