class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.products = []; // store product references
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert a product name and its data
  insert(productName, productData) {
    let node = this.root;
    const name = productName.toLowerCase();

    for (let char of name) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
      node.products.push(productData);
    }

    node.isEndOfWord = true;
  }

  // Search by prefix
  search(prefix) {
    let node = this.root;
    const lowerPrefix = prefix.toLowerCase();

    for (let char of lowerPrefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }

    // Return all products with this prefix
    return node.products;
  }
}

export default Trie;
