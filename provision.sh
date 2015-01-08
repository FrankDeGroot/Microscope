sudo yum -y install rsync
curl https://install.meteor.com/ | sh
sudo sh -c 'echo "[mongodb]
name=MongoDB Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
gpgcheck=0
enabled=1" >> /etc/yum.repos.d/mongodb.repo'
sudo yum -y install mongodb-org
