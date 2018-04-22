export type MutElem<T> = T & {
  parent?: MutElem<T> | undefined
  child?: MutElem<T> | undefined
}

export type ImutElem<T> = Readonly<T> & {
  readonly parent?: ImutElem<T> | undefined
  readonly child?: ImutElem<T> | undefined
}

export type Elem<T> = MutElem<T> | ImutElem<T>

/**
 * Given a elem in a vine, returns the root of vine.
 */
export function root<T>(elem: Elem<T>): Elem<T> {
  while (elem.parent) {
    elem = elem.parent
  }
  return elem
}

/**
 * Given a elem in a vine, returns the leaf of vine.
 */
export function leaf<T>(elem: Elem<T>): Elem<T> {
  while (elem.child) {
    elem = elem.child
  }
  return elem
}

/**
 * Given a elem in a vine, clones the entire vine. Returns a
 * reference to the same elem in the cloned vine.
 */
export function clone<T>(elem: ImutElem<T>): MutElem<T> {
  let newElem: MutElem<T> = { ...(elem as any) }
  let above = newElem
  let below = newElem

  // Clone everything above
  while (above.parent) {
    let newParent: MutElem<T> = { ...(above.parent as any) }
    above.parent = newParent
    newParent.child = above
    above = newParent
  }

  // Clone everything below
  while (below.child) {
    let newChild: MutElem<T> = { ...(below.child as any) }
    below.child = newChild
    newChild.child = below
    below = newChild
  }

  return newElem
}

/**
 * Joins two mutable elements of a vine. Returns the modified first argument.
 */
export function join<T>(leaves: MutElem<T>, roots: MutElem<T>): MutElem<T> {
  leaves.child = roots
  roots.parent = leaves
  return leaves
}

/**
 * Replaces the leaves of an immutable vine with a mutable T. Returns a
 * reference to the leaf of the new vine.
 */
export function replaceLeaves<T>(
  elem: ImutElem<T>,
  newLeaf: MutElem<T> | undefined,
): MutElem<T> {
  let newElem: MutElem<T> = { ...(elem as any) }
  let above = newElem

  // Clone everything above
  while (above.parent) {
    let newParent: MutElem<T> = { ...(above.parent as any) }
    above.parent = newParent
    newParent.child = above
    above = newParent
  }

  newElem.child = newLeaf
  if (newLeaf) {
    newLeaf.parent = newElem
  }

  return leaf(newElem)
}

/**
 * Given a elem of an immutable vine, returns a new vine that ends at the
 * given elemnt. Returns a reference to the same element in the new vine
 * (which is now the leaf).
 */
export function cutLeaves<T>(elem: ImutElem<T>): MutElem<T> {
  return replaceLeaves(elem, undefined)
}
