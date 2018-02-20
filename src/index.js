import {createNode} from "./create-node.js"
import CID from 'cids'
import Room from 'ipfs-pubsub-room'

import Graph from 'ipld-graph-builder'
import  dagPB from 'ipld-dag-pb'
const {DAGNode, DAGLink} = dagPB;

const ipfsOptions = {
  repo: '../ipfsRepo/1',// + Math.floor(Math.random() * 10000),
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
const run = (args)=>{
  switch(args[1].trim()){
    case 'getPeers':
      console.log("GetPeers:", channel.getPeers())
      break;
    case 'hasPeer':{
      const peer = args[2].trim();
      console.log('HasPeer ${peer}', channel.hasPeer(peer))
      break;
    }
    case 'leave':
      console.log("leave");
      channel.leave();
      break;
    case 'sendTo':{
      const peer = args[2].trim();
      const msg = args[3].trim();
      channel.sendTo(peer, msg);
      break;
    }
    case 'broaddcast':{
      const msg = args[2].trim();
      channel.broadcast(msg);
      break;
    }
    case 'get':{
      const cid = args[2].trim()
      store.dag.get(cid, (err, result) => {
        if (err) {
          throw err
        }
        console.log(`Do get ${cid}:`, result.value)
      })
      break;
    }
    case 'add':{
      const myData = {
        name: 'David',
        likes: ['js-ipfs', 'icecream', 'steak']
      }
      //zdpuAzZSktMhXjJu5zneSFrg9ue5rLXKAMC9KLigqhQ7Q7vRm
      store.dag.put(myData, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
        if (err) {
          throw err
        }
        console.log(cid.toBaseEncodedString())
      })
      break;
    }
    case 'put':{
      const obj = {
        Data: new Buffer('Some data'),
        Links: []
      }
      
      store.object.put(obj, (err, node) => {
        if (err) {
          throw err
        }
        console.log(node.toJSON().multihash)
        // Logs:
        // QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK
      })
    }
    break;
    case 'patchAddLink':{
      const multihash = args[2]
      store.object.patch.addLink(multihash, {
        name: 'some-link',
        size: 10,
        multihash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
      }, (err, newNode) => {
        if (err) {
          throw err
        }
        // newNode is node with the added link
        console.log("New node:", newNode);
      })
    }
    break;
    case 'patchRmLink':{
      const multihash = args[2]
      const lnk = new DAGLink('some-link',10,'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD')
      store.object.patch.rmLink(multihash, lnk, (err, newNode) => {
        if (err) {
          throw err
        }
        // newNode is node with the added link
        console.log("New node:", newNode);
      })
    }
    break;
    default:
      console.log("Do not understand,", args) 
    break;     
    
  }
  
}
ipfsOptions.callback = {
  onReady: (ipfs)=>{
    store = ipfs;
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
      //console.log(`Received message from ${message.from}: ${message.data.toString()} @ ${message.topicIDs}`);
      const args = message.data.toString().split(' ')
      switch(args[0].trim()){
        case 'do':
          run(args);
          break;
        default:
          console.log(`Received message from ${message.from}: ${message.data.toString()} @ ${message.topicIDs}`);
      
      }
    })
  }
}

createNode(ipfsOptions, (err, ipfs) => {
  if (err) {
    throw err
  }
  
  // const cid2 = new CID('zdpuAzZSktMhXjJu5zneSFrg9ue5rLXKAMC9KLigqhQ7Q7vRm')
  // //new CID(1, 'dag-pb', new Buffer('zdpuAzZSktMhXjJu5zneSFrg9ue5rLXKAMC9KLigqhQ7Q7vRm'))
  // ipfs.dag.get(cid2, (err, result) => {
  //   if (err) {
  //     throw err
  //   }
  //   console.log("function 1 result is:", result.value)
  //   setTimeout(()=>{
  //     ipfs.dag.get('zdpuAzZSktMhXjJu5zneSFrg9ue5rLXKAMC9KLigqhQ7Q7vRm', (e, r)=>{
  //       channel? channel.broadcast("I got some result!") : null
  //     })
  //   }, 5000)
  // })
  console.log('\nStart of the example:')

})

