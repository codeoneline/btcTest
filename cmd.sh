# 启动全部docker容器
docker start $(docker ps -a | awk '{ print $1}' | tail -n +2)
# 停止全部容器
docker stop $(docker ps -a | awk '{ print $1}' | tail -n +2)

# 启动全部mongo
docker start $(docker ps -a | awk '{ print $1}' | tail -n +2)
# 启动全部mpc
cd ~/13552128609/mpc-batch-shell/jacob_ds_btc_ok/admin
./startAll.sh
# 启动除leader外的agent 2423229
./startAllAgent.sh
#  tail -f storemanAgent.log.2023-03-07