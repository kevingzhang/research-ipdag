'use strict'

import IPFS from 'ipfs'


function createNode (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  options.path = options.path || '/tmp/ipfs' + Math.random()

  const node = new IPFS(options)

  node.on('start', () => callback(null, node))
  node.on('ready', () => {
    if(options.callback && typeof options.callback.onReady === 'function' )
      options.callback.onReady(node);
    else
      console.log("IPFS is ready")
  })    // Node is ready to use when you first create it
  node.on('error', (err) => {console.log("IPFS has error,", err)}) // Node has hit some error while initing/starting

  node.on('init', () => {console.log("IPFS init")})     // Node has successfully finished initing the repo
  node.on('stop', () => {console.log("IPFS stopped")})     // Node has stopped
}
export {createNode}
