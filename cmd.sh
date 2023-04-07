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