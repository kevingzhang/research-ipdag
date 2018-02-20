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
let channel, store;
ipfsOptions.callback = {
  onReady: (ipfs)=>{
    const room = Room(ipfs, 'weatherblock')
    store = ipfs;
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
    const args = line.trim().split(' ');
    if(args.length > 0){
      switch (args[0]) {
      
        case 'help':
          console.log('hello world, help information here!');
          break;
        case 'peers':
          console.log(channel? channel.getPeers(): "Channel not ready");
          break;
        case 'local':{
          localCommand(args, store);
          break;
        }
        default:
        if(channel){
          channel.broadcast(line.trim())
        }
        else  
          console.log(`Say what? I might have heard '${line.trim()}'`);
        break;
      }
      rl.prompt();
    }   
  }).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
  });
})

const localCommand = (args, store)=>{
  if (args.length == 0) return;
  switch(args[1]){
    case 'get':{
      const multihash = args[2];
      
      store.object.get(multihash, (err, node) => {
        console.log('response from command:', args.join(' '));
        if (err) {
          throw err
        }
        
        console.log(node.toJSON())
        // Logs:
        // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
      })
    }
    break;
    case 'data':{
      const multihash = args[2];
      
      store.object.data(multihash, (err, data) => {
        console.log('response from command:', args.join(' '));
        if (err) {
          throw err
        }
        
        console.log(data.toString())
        // Logs:
        // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
      })
    }
    break;
    case 'links':{
      const multihash = args[2];
      
      store.object.links(multihash, (err, links) => {
        console.log('response from command:', args.join(' '));
        if (err) {
          throw err
        }
        
        console.log(links)
        // Logs:
        // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
      })
    }
    break;
    case 'stat':{
      const multihash = args[2];
      
      store.object.stat(multihash, (err, stats) => {
        console.log('response from command:', args.join(' '));
        if (err) {
          throw err
        }
        
        console.log(stats)
        
      })
    }
    break;
    default:
      console.log("Unknown command", args);
    break;
  }
}