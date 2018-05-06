import * as Vine from "data-structures/vine"

export type NodeId = string

export const ROOT: NodeId = "0"

let id = 0
export function nextId(): NodeId {
  return String(++id)
}

export function createNode(): Node {
  let newId = nextId()
  return { logicalId: newId, physicalId: newId }
}

export interface Node {
  logicalId: NodeId
  physicalId: NodeId
}

export interface Tree {
  [logicalId: string]: Node[]
}

export type NodeRef = Vine.ImutElem<Node>
export type MutNodeRef = Vine.MutElem<Node>

export enum Direction {
  First = "First",
  Up = "Up",
  Down = "Down",
  Left = "Left",
  Right = "Right",
  Last = "Last",
}

// Some operations that modify the tree will return a new tree and a node.
// What the node refers to depends on the operation.
interface TreeAndNode {
  tree: Tree
  node: Node
}

// Other operations that move nodes around will return the new tree and a new
// vine elem containing the moved node.
interface TreeAndVine {
  tree: Tree
  vine: NodeRef
}

// Finds the index of a physical node in an array of nodes.
export function indexOfPhysicalNode(nodes: Node[], physicalId: NodeId) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].physicalId === physicalId) return i
  }
  return -1
}

// Error class for tree modifications.
export class ModificationError extends Error {}

/**
 * Adds a child to the given node, either as the first or last child. Returns
 * new updated tree and the newly created node.
 */
export function addChild(tree: Tree, ref: NodeRef, start: boolean): TreeAndNode {
  let { logicalId } = ref
  let newNode = createNode()
  let newChildren = tree[logicalId].slice()

  if (start) {
    newChildren.splice(0, 0, newNode)
  } else {
    newChildren.push(newNode)
  }

  let newTree = { ...tree, [logicalId]: newChildren, [newNode.logicalId]: [] }
  return { tree: newTree, node: newNode }
}

/**
 * Adds a sibling to the given node, either before or after the given node.
 * Returns new updated tree and the newly created node.
 */
export function addSibling(tree: Tree, ref: NodeRef, before: boolean): TreeAndNode {
  let { physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot add sibling to root node.")
  let newNode = createNode()
  let newChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newChildren, physicalId)

  if (before) {
    newChildren.splice(indexOfNode, 0, newNode)
  } else {
    newChildren.splice(indexOfNode + 1, 0, newNode)
  }

  let newTree = { ...tree, [parent.logicalId]: newChildren, [newNode.logicalId]: [] }
  return { tree: newTree, node: newNode }
}

/**
 * Deletes a node from the tree. Returns a new updated tree, as well as a set of
 * logical ids of nodes that no longer exist in the tree. Nodes no longer in the
 * tree will not exist in the children map. If any references to nodes are held
 * outside of the tree structure, the logical ids of those nodes may be passed
 * in as well and they will not be removed from the children map or be present
 * in the returned set of removed ids.
 */
export function deleteNode(
  tree: Tree,
  ref: NodeRef,
  extraReferences: NodeId[],
): { tree: Tree; removedIds: Set<NodeId> } {
  let { physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot delete the root node.")
  let newChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newChildren, physicalId)
  newChildren.splice(indexOfNode, 1)

  let newTree = { ...tree, [parent.logicalId]: newChildren }
  extraReferences.push(ROOT)
  let inaccessibleNodes = calculateInaccessibleNodes(newTree, extraReferences)

  for (let inaccessibleNode of inaccessibleNodes) {
    delete newTree[inaccessibleNode]
  }

  return { tree: newTree, removedIds: inaccessibleNodes }
}

/**
 * Removes all the children of a node. Returns a new updated tree, as well as
 * a set of logical ids of nodes that no longer exist in the tree. Nodes no
 * longer in the tree will not exist in the children map. If any references to
 * nodes are held outside of the tree structure, the logical ids of those nodes
 * may be passed in as well and they will not be removed from the children map
 * or be present in the returned set of removed ids.
 */
export function removeChildren(
  tree: Tree,
  ref: NodeRef,
  extraReferences: NodeId[],
): { tree: Tree; removedIds: Set<NodeId> } {
  let { logicalId } = ref
  let newTree = { ...tree, [logicalId]: [] }

  extraReferences.push(ROOT)
  let inaccessibleNodes = calculateInaccessibleNodes(newTree, extraReferences)

  for (let inaccessibleNode of inaccessibleNodes) {
    delete newTree[inaccessibleNode]
  }

  return { tree: newTree, removedIds: inaccessibleNodes }
}

/**
 * Removes a node and replaces it with its children. Returns a new updated
 * tree, and whether or not the node has been entirely removed from the tree. If
 * the caller already knows that they have another reference to this node they
 * can pass that information in to avoid extra computation.
 */
export function flatten(
  tree: Tree,
  ref: NodeRef,
  haveOtherReference?: boolean,
): { tree: Tree; stillReferenced: boolean } {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot flatten the root node.")
  if (tree[logicalId].length === 0) {
    throw new ModificationError("Cannot flatten node without any children.")
  }

  let newParentChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newParentChildren, physicalId)

  // We need to assign new physical ids to the children to prevent conflicts.
  let oldChildren = tree[logicalId].map(node => ({
    logicalId: node.logicalId,
    physicalId: nextId(),
  }))
  newParentChildren.splice(indexOfNode, 1, ...oldChildren)

  let newTree = { ...tree, [parent.logicalId]: newParentChildren }

  let stillReferenced = Boolean(haveOtherReference)
  if (!stillReferenced) {
    checkIfStillReferenced: for (let nodeId of Object.keys(newTree)) {
      // Don't need to check the children of the node itself.
      if (nodeId === logicalId) continue
      for (let child of newTree[nodeId]) {
        if (child.logicalId === nodeId) {
          stillReferenced = true
          break checkIfStillReferenced
        }
      }
    }
  }

  if (!stillReferenced) {
    delete newTree[logicalId]
  }

  return { stillReferenced, tree: newTree }
}

/**
 * Takes a node and replaces it with a new node and adds it as the child of the
 * new node. Returns a new updated tree and the new node.
 */
export function wrap(tree: Tree, ref: NodeRef): TreeAndNode {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot wrap root node.")
  let newNode = createNode()
  let newChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newChildren, physicalId)
  newChildren.splice(indexOfNode, 1, newNode)

  let newTree = {
    ...tree,
    [parent.logicalId]: newChildren,
    [newNode.logicalId]: [{ logicalId, physicalId }],
  }
  return { tree: newTree, node: newNode }
}

/**
 * Moves a node laterally amongst its siblings. Pass in +/- 1 to swap it with
 * its right or left sibling respectively. Pass in -Infinity to make the node
 * the first child and +Infinity to make it the last child. Returns a new
 * updated tree, or the same tree if the node didn't actually move.
 */
export function moveLaterally(tree: Tree, ref: NodeRef, dest: number): Tree {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot move the root node.")
  if (![-Infinity, -1, 1, Infinity].includes(dest)) {
    throw new Error(`Invalid argument to moveLaterally: ${dest}`)
  }
  let children = tree[parent.logicalId]
  let indexOfNode = indexOfPhysicalNode(children, physicalId)

  // Return the tree if node is already in position.
  if (indexOfNode === 0 && (dest === -1 || dest === -Infinity)) return tree
  if (indexOfNode === children.length && (dest === 1 || dest === Infinity)) return tree

  let deleteIndex = indexOfNode
  let insertIndex: number
  if (dest === -Infinity) {
    insertIndex = 0
  } else if (dest === -1) {
    insertIndex = deleteIndex - 1
  } else if (dest === 1) {
    insertIndex = deleteIndex + 1
  } else {
    insertIndex = children.length
  }

  let newChildren = children.slice()
  let removed = newChildren.splice(deleteIndex, 1)
  newChildren.splice(insertIndex, 0, removed[0])

  return { ...tree, [parent.logicalId]: newChildren }
}

/**
 * Moves a node up in the tree, making it the right sibling of its parent.
 * Returns a new updated tree and a vine to the new location of the node.
 */
export function moveUp(tree: Tree, ref: NodeRef): TreeAndVine {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot move the root node.")
  let {
    logicalId: parentLogicalId,
    physicalId: parentPhysicalId,
    parent: grandParent,
  } = parent
  if (!grandParent) throw new ModificationError("Cannot move child of root node up.")

  let newParentChildren = tree[parentLogicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newParentChildren, physicalId)
  newParentChildren.splice(indexOfNode, 1)

  let newGrandParentChildren = tree[grandParent.logicalId].slice()
  let indexOfParent = indexOfPhysicalNode(newGrandParentChildren, parentPhysicalId)

  // Need a new physicalId, since we're adding new children.
  let newNode = { logicalId, physicalId: nextId() }
  newGrandParentChildren.splice(indexOfParent + 1, 0, newNode)

  let newTree = {
    ...tree,
    [parent.logicalId]: newParentChildren,
    [grandParent.logicalId]: newGrandParentChildren,
  }
  let newVine = Vine.replaceLeaves(grandParent, { ...newNode })
  return { tree: newTree, vine: newVine }
}

/**
 * Moves a node down in the tree, making it the last child of its left sibling.
 * If it doesn't have a left sibling it makes it the first child of its right
 * sibling. Throws if it has no siblings. Returns a new updated tree and a vine
 * to the new location of the node.
 */
export function moveDown(tree: Tree, ref: NodeRef): TreeAndVine {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot move the root node.")

  // Need a new physicalId, since we're adding new children.
  let newNode = { logicalId, physicalId: nextId() }
  let siblings = tree[parent.logicalId]
  if (siblings.length === 1) {
    throw new ModificationError("Cannot move only child down in tree.")
  }
  let indexOfNode = indexOfPhysicalNode(siblings, physicalId)

  let firstChild = indexOfNode === 0
  let sibling = firstChild ? siblings[1] : siblings[indexOfNode - 1]
  if (sibling.logicalId === logicalId) {
    throw new ModificationError("Cannot move node into copy of itself.")
  }

  let newSiblings = siblings.slice()
  newSiblings.splice(indexOfNode, 1)
  let newNephews = tree[sibling.logicalId].slice()

  if (firstChild) {
    newNephews.splice(0, 0, newNode)
  } else {
    newNephews.push(newNode)
  }

  let newTree = {
    ...tree,
    [parent.logicalId]: newSiblings,
    [sibling.logicalId]: newNephews,
  }
  let newVine = Vine.replaceLeaves(parent, Vine.join({ ...sibling }, { ...newNode }))
  return { tree: newTree, vine: newVine }
}

/**
 * Duplicates a node and adds the duplicated node as the next sibling of
 * original node. Returns a new updated tree and the new node.
 */
export function duplicateNode(tree: Tree, ref: NodeRef): TreeAndNode {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot duplicate root node.")
  let newPhysicalId = nextId()
  let newNode = { logicalId, physicalId: newPhysicalId }
  let newChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newChildren, physicalId)
  newChildren.splice(indexOfNode + 1, 0, newNode)

  let newTree = { ...tree, [parent.logicalId]: newChildren }
  return { tree: newTree, node: newNode }
}

/**
 * Shallowly duplicates a node and adds it as the next sibling of the duplicated
 * node. The new node is not linked to the previous one, but all of its children
 * are linked to the children of the original node. Returns a new updated tree
 * and the new node.
 */
export function shallowDuplicate(tree: Tree, ref: NodeRef): TreeAndNode {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot duplicate root node.")
  let newNode = createNode()
  let newChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newChildren, physicalId)
  newChildren.splice(indexOfNode + 1, 0, newNode)

  let newTree = {
    ...tree,
    [parent.logicalId]: newChildren,
    [newNode.logicalId]: tree[logicalId].slice(),
  }
  return { tree: newTree, node: newNode }
}

/**
 * Performs a deep duplication of a node and adds it as the next sibling of the
 * duplicated node. The new node is not linked to the previous one, nor are any
 * of its descendents. Returns the new updated a tree, the new node, and a map
 * from logical ids to dulpicated logical ids.
 */
export function deepDuplicate(
  tree: Tree,
  ref: NodeRef,
): { tree: Tree; node: Node; mapping: { [index: string]: NodeId } } {
  let { logicalId, physicalId, parent } = ref
  if (!parent) throw new ModificationError("Cannot duplicate root node.")

  let { mapping, subTree, rootId } = duplicateSubTree(tree, ref.logicalId)

  let newPhysicalId = nextId()
  let newNode = { logicalId: rootId, physicalId: newPhysicalId }
  let newChildren = tree[parent.logicalId].slice()
  let indexOfNode = indexOfPhysicalNode(newChildren, physicalId)
  newChildren.splice(indexOfNode + 1, 0, newNode)

  let newTree = {
    ...tree,
    ...subTree,
    [parent.logicalId]: newChildren,
  }
  return { mapping, tree: newTree, node: newNode }
}

/**
 * Duplicates a subtree by generating new logical ids (and physical ids) for every
 * element in the subtree. Returns the new tree with the new node and mappings
 * from original logicalIds of nodes to the new logicalIds.
 */
function duplicateSubTree(
  tree: Tree,
  root: NodeId,
): { subTree: Tree; rootId: NodeId; mapping: { [index: string]: NodeId } } {
  let mapping: { [index: string]: NodeId } = {}
  let idsToProcess = [root]

  // Find all nodes we need to duplicate and generate a new logical id for each.
  while (idsToProcess.length > 0) {
    let idToProcess = idsToProcess.pop()!
    for (let child of tree[idToProcess]) {
      let { logicalId } = child
      if (!(logicalId in mapping)) {
        idsToProcess.push(logicalId)
        mapping[logicalId] = nextId()
      }
    }
  }

  let subTree: Tree = {}
  Object.entries(mapping).forEach(entry => {
    let [originalId, newId] = entry
    let newChildren = tree[originalId].map(node => ({
      logicalId: mapping[node.logicalId],
      physicalId: nextId(),
    }))
    subTree[newId] = newChildren
  })

  return { mapping, subTree, rootId: mapping[root] }
}

/**
 * Dissociates a node from any duplicates that exist in the tree, guaranteeing
 * that any any edits only affect the given node. This method replaces the
 * entire vine, even if technically the last node needs to be replaced. Because
 * of this, some nodes may be no longer accessible. To accurately calculate the
 * set of inaccessible nodes the caller must pass in an array of any extra
 * references they have into the tree. Returns the new tree, a new reverseRef
 * to the node and a Set of logical ids of nodes that are no longer accessible.
 */
export function dissociate(
  tree: Tree,
  ref: NodeRef,
  extraReferences: NodeId[],
): { tree: Tree; ref: NodeRef; removedIds: Set<NodeId> } {
  let leaves = Vine.root(ref)
  if (!leaves.child) {
    throw new ModificationError("Can't dissociate the root node.")
  }

  let newTree = { ...tree }
  while (leaves.child) {
    let { logicalId, physicalId, child } = leaves
    let newNode = createNode()

    let newChildren = tree[logicalId].slice()
    let indexOfNode = indexOfPhysicalNode(newChildren, child.physicalId)
    newChildren[indexOfNode] = newNode
    newTree[logicalId] = newChildren
    newTree[newNode.logicalId] = tree[child.logicalId]

    let newChild = { ...newNode, child: child.child }
    leaves = Vine.join(leaves, newChild)
  }

  // Now we have to remove an inaccessible nodes in case we replaced more than
  // we needed to.
  let inaccessibleNodes = calculateInaccessibleNodes(newTree, [ROOT, ...extraReferences])

  for (let inaccessibleNode of inaccessibleNodes) {
    delete newTree[inaccessibleNode]
  }

  return { ref: leaves, tree: newTree, removedIds: inaccessibleNodes }
}

/**
 * Calculates which nodes are inaccessible in a given tree given an array of
 * initial references into the tree.
 */
function calculateInaccessibleNodes(tree: Tree, references: NodeId[]): Set<NodeId> {
  let unreferencedNodes: Set<NodeId> = new Set(Object.keys(tree))
  for (let ref of references) {
    unreferencedNodes.delete(ref)
  }

  let nodesToProcess = references

  while (nodesToProcess.length !== 0) {
    let nodeToProcess = nodesToProcess.pop()!
    unreferencedNodes.delete(nodeToProcess)

    let children = tree[nodeToProcess]
    for (let child of children) {
      let childId = child.logicalId
      if (unreferencedNodes.has(childId)) {
        unreferencedNodes.delete(childId)
        nodesToProcess.push(childId)
      }
    }
  }

  return unreferencedNodes
}
