import {createNode} from "./create-node.js"
import Room from 'ipfs-pubsub-room'
import readline from 'readline'

const ipfsOptions = {
  repo: '../ipfsRepo/cli',// + Math.floor(Math.random() * 10000),
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
}
let channel;
ipfsOptions.callback = {
  onReady: (ipfs)=>{
    const room = Room(ipfs, 'weatherblock')
    channel = room;

    room.on('peer joined', (peer) => {
      console.log('Peer joined the room', peer)
    })

    room.on('peer left', (peer) => {
      console.log('Peer left...', peer)
    })

    // now started to listen to room
    room.on('subscribed', () => {
      console.log('Now connected!')
    })

    room.on('message', (message)=>{
      console.log(`Received message from ${message.from}: ${message.data.toString()} @ ${message.topicIDs}`);
    })
  }
}

createNode(ipfsOptions, (err, ipfs) => {
  if (err) {
    throw err
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'ALOHA> '
  });
  
  rl.prompt();
  
  rl.on('line', (line) => {
    switch (line.trim()) {
      case '':break;
      case 'help':
        console.log('hello world, help information here!');
        break;
      case 'peers':
        console.log(channel? channel.getPeers(): "Channel not ready");
        break;
      default:
      if(channel){
        channel.broadcast(line.trim())
      }
      else  
        console.log(`Say what? I might have heard '${line.trim()}'`);
      break;
    }
    rl.prompt();
  }).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
  });
})

