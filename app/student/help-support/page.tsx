// app/dashboard/help-support/page.tsx
'use client';

import { useState } from 'react';
import {
    HelpCircle,
    MessageCircle,
    Mail,
    Phone,
    Clock,
    FileText,
    BookOpen,
    Video,
    Download,
    Search,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Send,
    Star,
    ThumbsUp,
    ThumbsDown,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    X,
    ExternalLink,
    Link2,
    FileQuestion,
    LifeBuoy,
    GraduationCap,
    Users,
    Globe,
    Shield,
    Smartphone,
    Laptop,
    Database,
    Lock,
    Settings,
    Play,
    MessageSquare,
    Headphones,
    Award,
    Clock as ClockIcon,
    MapPin,
    DollarSign,
    Heart,
    BookMarked
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Types
interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: 'general' | 'applications' | 'placement' | 'internship' | 'reports' | 'evaluations' | 'technical';
    helpful: number;
    notHelpful: number;
}

interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: Date;
    updatedAt: Date;
    attachments?: string[];
    messages?: {
        id: string;
        sender: string;
        message: string;
        timestamp: Date;
        isStaff: boolean;
    }[];
}

interface Guide {
    id: string;
    title: string;
    description: string;
    category: string;
    readTime: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    url: string;
    popular: boolean;
}

interface ContactMethod {
    id: string;
    type: 'email' | 'phone' | 'chat' | 'office';
    title: string;
    details: string;
    availability: string;
    responseTime: string;
    icon: any;
    action: string;
    actionLink: string;
}

// Mock data
const mockFAQs: FAQ[] = [
    {
        id: '1',
        question: 'How do I apply for an internship?',
        answer: 'To apply for an internship, navigate to the "Internship Applications" section in the sidebar. Click on "Apply for Internship", fill out the application form with your personal information, academic background, and preferred departments. Upload your CV, cover letter, and any supporting documents. Review your application and submit. You can track your application status in "My Applications".',
        category: 'applications',
        helpful: 45,
        notHelpful: 3
    },
    {
        id: '2',
        question: 'How is the placement matching process done?',
        answer: 'Our placement matching system uses a skill-based algorithm that considers your academic background, skills, preferences, and supervisor availability. The system recommends placements based on compatibility scores. Coordinators review these recommendations and make final placement decisions. You will receive a notification when your placement is confirmed.',
        category: 'placement',
        helpful: 38,
        notHelpful: 5
    },
    {
        id: '3',
        question: 'How do I submit my weekly reports?',
        answer: 'Go to "Reports" > "Submit Report". Select the report type (weekly/monthly/final), choose the relevant week/month, upload your report file (PDF or DOCX), add an abstract and keywords, and submit. Your report will be sent to your supervisor for review. You can track the status in "My Submissions".',
        category: 'reports',
        helpful: 52,
        notHelpful: 2
    },
    {
        id: '4',
        question: 'How can I contact my supervisor?',
        answer: 'You can message your supervisor directly through the "Messages" section. Select your supervisor from the contacts list and send a message. You can also schedule meetings through the calendar integration. For urgent matters, you can find their contact information in "My Internship" > "Supervisor Info".',
        category: 'internship',
        helpful: 41,
        notHelpful: 1
    },
    {
        id: '5',
        question: 'What should I do if I face technical issues?',
        answer: 'If you encounter any technical problems, first try refreshing the page or clearing your browser cache. If the issue persists, contact our technical support team through the support ticket system below, or email us at support@internship.edu. Please include screenshots and a detailed description of the issue.',
        category: 'technical',
        helpful: 28,
        notHelpful: 4
    },
    {
        id: '6',
        question: 'How do I view my evaluation feedback?',
        answer: 'Navigate to "Evaluations" > "View Feedback". All your completed evaluations will be listed there. Click on any evaluation to view detailed feedback, scores, and comments from your supervisor. You can download the evaluation reports for your records.',
        category: 'evaluations',
        helpful: 35,
        notHelpful: 0
    }
];

const mockGuides: Guide[] = [
    {
        id: '1',
        title: 'Getting Started with the Internship Portal',
        description: 'A comprehensive guide for new students to navigate the platform and complete your profile.',
        category: 'Getting Started',
        readTime: 5,
        level: 'beginner',
        url: '/guides/getting-started',
        popular: true
    },
    {
        id: '2',
        title: 'How to Write an Effective Internship Application',
        description: 'Tips and tricks to make your application stand out to placement coordinators.',
        category: 'Applications',
        readTime: 8,
        level: 'beginner',
        url: '/guides/application-tips',
        popular: true
    },
    {
        id: '3',
        title: 'Making the Most of Your Internship Experience',
        description: 'Strategies to maximize learning and build professional relationships.',
        category: 'Internship',
        readTime: 10,
        level: 'intermediate',
        url: '/guides/maximize-experience',
        popular: false
    },
    {
        id: '4',
        title: 'Understanding Evaluation Criteria',
        description: 'Detailed explanation of how supervisors evaluate student performance.',
        category: 'Evaluations',
        readTime: 6,
        level: 'beginner',
        url: '/guides/evaluation-criteria',
        popular: true
    },
    {
        id: '5',
        title: 'Research Methodology for Interns',
        description: 'Guide to conducting research and writing reports during your internship.',
        category: 'Research',
        readTime: 12,
        level: 'advanced',
        url: '/guides/research-methodology',
        popular: false
    }
];

const mockContactMethods: ContactMethod[] = [
    {
        id: '1',
        type: 'email',
        title: 'Email Support',
        details: 'support@internship.edu',
        availability: '24/7',
        responseTime: 'Within 24 hours',
        icon: Mail,
        action: 'Send Email',
        actionLink: 'mailto:support@internship.edu'
    },
    {
        id: '2',
        type: 'phone',
        title: 'Phone Support',
        details: '+1 (555) 123-4567',
        availability: 'Mon-Fri, 9AM-5PM',
        responseTime: 'Immediate',
        icon: Phone,
        action: 'Call Now',
        actionLink: 'tel:+15551234567'
    },
    {
        id: '3',
        type: 'chat',
        title: 'Live Chat',
        details: 'Chat with our support team',
        availability: 'Mon-Fri, 9AM-5PM',
        responseTime: 'Within 5 minutes',
        icon: MessageCircle,
        action: 'Start Chat',
        actionLink: '#'
    },
    {
        id: '4',
        type: 'office',
        title: 'Visit Us',
        details: 'Student Support Center, Room 101',
        availability: 'Mon-Fri, 9AM-4PM',
        responseTime: 'Walk-in',
        icon: MapPin,
        action: 'Get Directions',
        actionLink: '#'
    }
];

export default function HelpSupport() {
    const [activeTab, setActiveTab] = useState<'faq' | 'guides' | 'tickets' | 'contact'>('faq');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
    const [faqFeedback, setFaqFeedback] = useState<Record<string, 'helpful' | 'not-helpful' | null>>({});
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        category: 'technical',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    const toggleFAQ = (faqId: string) => {
        setExpandedFAQs(prev =>
            prev.includes(faqId)
                ? prev.filter(id => id !== faqId)
                : [...prev, faqId]
        );
    };

    const handleFAQFeedback = (faqId: string, isHelpful: boolean) => {
        setFaqFeedback({ ...faqFeedback, [faqId]: isHelpful ? 'helpful' : 'not-helpful' });
        // In a real app, you would send this to the backend
    };

    const handleSubmitTicket = async () => {
        if (!newTicket.subject || !newTicket.description) return;

        const ticket: SupportTicket = {
            id: `TKT-${Date.now()}`,
            ...newTicket,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setTickets([ticket, ...tickets]);
        setShowTicketForm(false);
        setNewTicket({ subject: '', description: '', category: 'technical', priority: 'medium' });
    };

    const filteredFAQs = mockFAQs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGuides = mockGuides.filter(guide =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center space-x-3">
                                <LifeBuoy className="h-8 w-8 text-blue-600" />
                                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Get help with your internship journey or contact our support team
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for help articles, FAQs, or guides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <button
                        onClick={() => setActiveTab('faq')}
                        className="group rounded-2xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">FAQs</h3>
                        <p className="text-xs text-gray-500">Common questions</p>
                    </button>

                    <button
                        onClick={() => setActiveTab('guides')}
                        className="group rounded-2xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">Guides</h3>
                        <p className="text-xs text-gray-500">Step-by-step tutorials</p>
                    </button>

                    <button
                        onClick={() => setActiveTab('tickets')}
                        className="group rounded-2xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">Support Tickets</h3>
                        <p className="text-xs text-gray-500">Track your requests</p>
                    </button>

                    <button
                        onClick={() => setActiveTab('contact')}
                        className="group rounded-2xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">Contact Us</h3>
                        <p className="text-xs text-gray-500">Get in touch</p>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {/* FAQs Tab */}
                    {activeTab === 'faq' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                                <div className="text-sm text-gray-500">
                                    {filteredFAQs.length} articles found
                                </div>
                            </div>

                            <div className="space-y-3">
                                {filteredFAQs.map((faq) => (
                                    <div key={faq.id} className="rounded-lg border border-gray-200">
                                        <button
                                            onClick={() => toggleFAQ(faq.id)}
                                            className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                                        >
                                            <span className="font-medium text-gray-900">{faq.question}</span>
                                            {expandedFAQs.includes(faq.id) ? (
                                                <ChevronUp className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>

                                        {expandedFAQs.includes(faq.id) && (
                                            <div className="border-t border-gray-200 p-4">
                                                <p className="text-gray-600">{faq.answer}</p>

                                                <div className="mt-4 flex items-center space-x-4">
                                                    <span className="text-sm text-gray-500">Was this helpful?</span>
                                                    <button
                                                        onClick={() => handleFAQFeedback(faq.id, true)}
                                                        className={`flex items-center space-x-1 rounded-lg px-2 py-1 text-sm ${faqFeedback[faq.id] === 'helpful'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'text-gray-500 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                        <span>Yes ({faq.helpful})</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleFAQFeedback(faq.id, false)}
                                                        className={`flex items-center space-x-1 rounded-lg px-2 py-1 text-sm ${faqFeedback[faq.id] === 'not-helpful'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'text-gray-500 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                        <span>No ({faq.notHelpful})</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {filteredFAQs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileQuestion className="h-12 w-12 text-gray-400" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Try different keywords or contact our support team
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guides Tab */}
                    {activeTab === 'guides' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
                                <div className="text-sm text-gray-500">
                                    {filteredGuides.length} guides available
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {filteredGuides.map((guide) => (
                                    <Link
                                        key={guide.id}
                                        href={guide.url}
                                        className="group rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                                        {guide.title}
                                                    </h3>
                                                    {guide.popular && (
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                            <Star className="mr-1 h-3 w-3" />
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{guide.description}</p>
                                                <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
                                                    <span className="flex items-center">
                                                        <ClockIcon className="mr-1 h-3 w-3" />
                                                        {guide.readTime} min read
                                                    </span>
                                                    <span className="capitalize">{guide.level}</span>
                                                    <span>{guide.category}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Support Tickets Tab */}
                    {activeTab === 'tickets' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
                                <button
                                    onClick={() => setShowTicketForm(true)}
                                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    New Ticket
                                </button>
                            </div>

                            {tickets.length === 0 && !showTicketForm && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <MessageCircle className="h-12 w-12 text-gray-400" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No support tickets</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Create a new ticket to get help from our support team
                                    </p>
                                    <button
                                        onClick={() => setShowTicketForm(true)}
                                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                    >
                                        Create Ticket
                                    </button>
                                </div>
                            )}

                            {showTicketForm && (
                                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Ticket</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Subject *</label>
                                            <input
                                                type="text"
                                                value={newTicket.subject}
                                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                placeholder="Brief description of your issue"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <select
                                                value={newTicket.category}
                                                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="technical">Technical Issue</option>
                                                <option value="application">Application Issue</option>
                                                <option value="placement">Placement Issue</option>
                                                <option value="report">Report Submission</option>
                                                <option value="evaluation">Evaluation Question</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                                            <select
                                                value={newTicket.priority}
                                                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="low">Low - Not urgent</option>
                                                <option value="medium">Medium - Can wait a few days</option>
                                                <option value="high">High - Urgent issue</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description *</label>
                                            <textarea
                                                rows={5}
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                                placeholder="Please provide detailed information about your issue..."
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setShowTicketForm(false)}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmitTicket}
                                                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit Ticket
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                        }`}>
                                                        {ticket.priority} priority
                                                    </span>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{ticket.description}</p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Created: {format(ticket.createdAt, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-700">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div>
                            <h2 className="mb-6 text-xl font-semibold text-gray-900">Contact Support</h2>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {mockContactMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <div key={method.id} className="rounded-lg border border-gray-200 p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="rounded-xl bg-blue-100 p-3">
                                                    <Icon className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                                                    <p className="text-sm text-gray-600">{method.details}</p>
                                                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                                                        <p>Available: {method.availability}</p>
                                                        <p>Response: {method.responseTime}</p>
                                                    </div>
                                                    <Link
                                                        href={method.actionLink}
                                                        className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        {method.action}
                                                        <ExternalLink className="ml-1 h-3 w-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 rounded-lg bg-blue-50 p-6">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">Emergency Support</h3>
                                        <p className="mt-1 text-sm text-blue-800">
                                            For urgent matters during office hours, please call our support hotline immediately.
                                            For after-hours emergencies, email emergency@internship.edu with "URGENT" in the subject line.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Resources */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <Video className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Video Tutorials</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Watch step-by-step video guides on using the platform
                        </p>
                        <Link href="#" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">
                            Watch Now →
                        </Link>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <Download className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-gray-900">User Manual</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Download the complete user manual for reference
                        </p>
                        <Link href="#" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">
                            Download PDF →
                        </Link>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">Peer Support</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Connect with fellow students for peer support
                        </p>
                        <Link href="#" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">
                            Join Community →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}