const dagPB = require('ipld-dag-pb')
const {DAGNode} = dagPB
DAGNode.create(new Buffer('some data'), (err, node1) => {
  if (err) {
    throw error
  }
  // node1 is your DAGNode instance.
})

DAGNode.create('some data', (err, node2) => {
  // node2 will have the same data as node1.
  console.log("node2", node2);
})