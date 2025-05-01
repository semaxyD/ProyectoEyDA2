class Node {
    constructor(data) {
      this.data = data;
      this.next = null;
    }
  }
  
  export class SubjectLinkedList {
    constructor() {
      this.head = null;
    }
  
    insertSorted(subject) {
      const newNode = new Node(subject);
      if (!this.head || subject.semester < this.head.data.semester) {
        newNode.next = this.head;
        this.head = newNode;
        return;
      }
  
      let current = this.head;
      while (current.next && current.next.data.semester < subject.semester) {
        current = current.next;
      }
  
      newNode.next = current.next;
      current.next = newNode;
    }
  
    toArray() {
      const result = [];
      let current = this.head;
      while (current) {
        result.push(current.data);
        current = current.next;
      }
      return result;
    }
  }
  