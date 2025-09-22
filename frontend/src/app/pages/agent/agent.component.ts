import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen bg-gray-50 flex">
      
      <!-- Sidebar -->
      <div class="w-64 bg-white border-r border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h1 class="text-lg font-semibold text-gray-800">Agent Dashboard</h1>
        </div>
        
        <nav class="p-4 space-y-2">
          <button 
            *ngFor="let tab of tabs" 
            (click)="activeTab = tab.id"
            [class]="'w-full text-left px-3 py-2 rounded-md text-sm ' + 
                     (activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50')"
          >
            {{tab.name}}
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-800">
              {{getCurrentTab()?.name}}
            </h2>
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-500">Status:</span>
              <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 p-6">
          
          <!-- Active Tickets -->
          <div *ngIf="activeTab === 'tickets'" class="space-y-4">
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-4 border-b border-gray-200">
                <h3 class="font-medium text-gray-800">Active Tickets</h3>
              </div>
              <div class="divide-y divide-gray-200">
                <div *ngFor="let ticket of tickets" class="p-4 hover:bg-gray-50">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-gray-800">#{{ticket.id}} - {{ticket.title}}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ticket.customer}}</p>
                    </div>
                    <div class="text-right">
                      <span [class]="'px-2 py-1 text-xs rounded-full ' + getPriorityClass(ticket.priority)">
                        {{ticket.priority}}
                      </span>
                      <p class="text-xs text-gray-500 mt-1">{{ticket.time}}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Interface -->
          <div *ngIf="activeTab === 'chat'" class="h-full flex flex-col">
            <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col">
              
              <!-- Chat Messages -->
              <div class="flex-1 p-4 overflow-y-auto space-y-3">
                <div *ngFor="let message of messages" 
                     [class]="'flex ' + (message.sender === 'agent' ? 'justify-end' : 'justify-start')">
                  <div [class]="'max-w-xs px-3 py-2 rounded-lg text-sm ' + 
                               (message.sender === 'agent' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800')">
                    {{message.text}}
                  </div>
                </div>
              </div>

              <!-- Chat Input -->
              <div class="border-t border-gray-200 p-4">
                <div class="flex space-x-2">
                  <input 
                    [(ngModel)]="newMessage"
                    (keyup.enter)="sendMessage()"
                    type="text" 
                    placeholder="Type your message..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                  <button 
                    (click)="sendMessage()"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Knowledge Base -->
          <div *ngIf="activeTab === 'knowledge'" class="space-y-4">
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-4 border-b border-gray-200">
                <h3 class="font-medium text-gray-800">Quick References</h3>
              </div>
              <div class="p-4 space-y-3">
                <div *ngFor="let item of knowledgeItems" class="p-3 bg-gray-50 rounded-md">
                  <h4 class="font-medium text-gray-800 text-sm">{{item.title}}</h4>
                  <p class="text-xs text-gray-600 mt-1">{{item.description}}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AgentComponent {
  activeTab = 'tickets';
  newMessage = '';

  tabs = [
    { id: 'tickets', name: 'Active Tickets' },
    { id: 'chat', name: 'Live Chat' },
    { id: 'knowledge', name: 'Knowledge Base' }
  ];

  tickets = [
    { id: '001', title: 'Login Issue', customer: 'John Doe', priority: 'High', time: '2 min ago' },
    { id: '002', title: 'Payment Problem', customer: 'Jane Smith', priority: 'Medium', time: '5 min ago' },
    { id: '003', title: 'Feature Request', customer: 'Bob Wilson', priority: 'Low', time: '10 min ago' }
  ];

  messages = [
    { sender: 'customer', text: 'Hi, I need help with my account' },
    { sender: 'agent', text: 'Hello! I\'d be happy to help. What seems to be the issue?' },
    { sender: 'customer', text: 'I can\'t log into my account' }
  ];

  knowledgeItems = [
    { title: 'Password Reset', description: 'Steps to reset customer passwords' },
    { title: 'Billing Issues', description: 'Common billing problems and solutions' },
    { title: 'Account Setup', description: 'Guide for new account creation' }
  ];

  getCurrentTab() {
    return this.tabs.find(tab => tab.id === this.activeTab);
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ sender: 'agent', text: this.newMessage });
      this.newMessage = '';
    }
  }
}