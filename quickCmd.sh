# 1 generate regtest wallet
# bitcoin-cli -regtest -named createwallet wallet_name="regtest_desc_wallet" descriptors=true

# 2 generate blocks
# bitcoin-cli -regtest -generate 101

# 3 send transaction
# bitcoin-cli -regtest sendtoaddress [address] 15.1

# 4 get transaction
# bitcoin-cli -regtest gettransaction e834a4ac6ef754164c8e3f0be4f34531b74b768199ffb244ab9f6cb1bbc7465a

# 5 Test with NodeJS
# npm install -g bitcointest

# bcrt1qm34nrdyht84qjzdr6eyx0f2l5ywfqtnx5ry70g

bitcoin-cli -chain=regtest -conf=/home/jsw/btc/cfg/bitcoin.conf $1