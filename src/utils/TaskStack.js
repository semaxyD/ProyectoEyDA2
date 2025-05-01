export class TaskStack {
    constructor() {
      this.stack = [];
    }
  
    push(task) {
      this.stack.push(task);
    }
  
    pop() {
      return this.stack.pop();
    }
  
    peek() {
      return this.stack[this.stack.length - 1];
    }
  
    isEmpty() {
      return this.stack.length === 0;
    }
  
    toArray() {
      return [...this.stack].reverse(); // últimas tareas arriba
    }
  }
  