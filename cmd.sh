# 启动全部docker容器
docker start $(docker ps -a | awk '{ print $1}' | tail -n +2)
# 停止全部容器
docker stop $(docker ps -a | awk '{ print $1}' | tail -n +2)

# 启动wanBridge-apiServer
sudo service mongod start
cd ~/code/wanchain/wanbridge-apiserver
node src/wanBridgeApiServer.js
node src/utxo.js

# 启动全部mongo
docker start $(docker ps -a | awk '{ print $1}' | tail -n +2)
# 启动全部mpc
cd ~/13552128609/mpc-batch-shell/jacob_ds_btc_ok/admin
./startAll.sh
# 启动除leader外的agent 2423229
./startAllAgent.sh
#  tail -f storemanAgent.log.2023-03-07

# db.event.update({"hashX" : "0xc607214e5bdb4ddb59b76d20ebb86367233bf2fbb4f1213b8aff65f325c9b83d"}, {$set:{"toHtlcAddr": "tb1pgkx9txtgg5x6m7wm8cpzh8qshmr4y5zvcg06u2lzhd56tnm5e2csy3ruxs"}})

db.event.update({"hashX" : "0x6e8b838938a36da10a3e6fabd972abb8fa03cde50e440775911fe652e1cb3c9d"}, {$unset: { "failReason": "", "failAction": "" }})
db.event.update({"hashX" : "0x6e8b838938a36da10a3e6fabd972abb8fa03cde50e440775911fe652e1cb3c9d"}, {$set: { "status": "waitOtaRedeem" }})



https://blockstream.info/testnet/tx/9cd151e71e2199137112ab13808858aa7bfba454ba615e3adaf577693133dea0?expand
https://blockstream.info/testnet/tx/b9b454acb72178193d3ade9d9a1797ed7332a0b21b677f4a57c1410083370997?expand
https://blockstream.info/testnet/tx/174c957067ccbaf3eeec5b2035dd9d1a85a524189a5085745fc97d0b3419fb29?expand
https://blockstream.info/testnet/tx/9cd151e71e2199137112ab13808858aa7bfba454ba615e3adaf577693133dea0?expand


# /var/lib/mongodb

waddress=(
    '0xacd98dd88471d826e9f7a86e917dd8d912d25f94'
    '0xe070132a9017b256de8513b48d472a99629f5a25'
    '0x9009b741ca9ae4691166f6f0b5cf47d3162e9430'
    '0xcfb935ff32d0c78ae23ca17fdeeb746f07e52a69'
    '0xc9e605d58ab45124e029d8c61be4ef7115479fd3'
    '0x10f3120770112533468db0c39722f6c18776b0c8'
    '0x44ba9c00e11ce7f1c0b5ef44d105051d12a973a5'
    '0x26013bcd0f3896caacadae834e3a6850e753e451'
)

cd /home/jsw/code/wanchain/js-storeman-agent

cfg=/home/jsw/13552128609/mpc-batch-shell/jacob_ds_btc_ok

# for i in {1,2,3,4,5,6,7,8}; do        
# for i in {2,3,4,5,6,7,8}; do  

for i in {2,3,4,5,6,7,8}; do   
  leader=
  if [ $i = 1 ]; then
    leader=--leader
  fi

  # echo ${leader}
  # echo ${waddress[${i} - 1]}

  # nohup node ./index.js --testnet --waddress=${waddress[${i} - 1]} --password=${cfg}/conf/cfg/pwd.json --keystore=${cfg}/nodes/n0${i}/ks --dbip=127.0.0.1 --dbport=27${i}17 --mpcpath=${cfg}/nodes/n0${i}/data >  /tmp/agent${i} 2>&1 &

  nohup node ./index.js \
  --testnet \
  ${leader} \
  --waddress=${waddress[${i} - 1]} \
  --password=${cfg}/conf/cfg/pwd.json \
  --keystore=${cfg}/nodes/n0${i}/ks \
  --dbip=127.0.0.1 \
  --dbport=27${i}17 \
  --mpc \
  --mpcipc=${cfg}/nodes/n0${i}/data/mpc.ipc \
  --mpcpath=${cfg}/nodes/n0${i}/data \
  >  /tmp/agent${i} 2>&1 &
done
