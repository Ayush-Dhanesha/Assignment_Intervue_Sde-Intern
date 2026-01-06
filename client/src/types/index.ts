export interface User {
    id: string;
    name: string;
    email: string;
    role: 'teacher' | 'student';
    isKicked?: boolean;
}

export interface Student {
    _id: string;
    name: string;
    email: string;
    isKicked: boolean;
    createdAt: string;
}

export interface PollOption {
    _id?: string;
    text: string;
    votes: number;
    votedBy?: string[];
    isCorrect?: boolean;
}

export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    createdBy: {
        _id: string;
        name: string;
    };
    isActive: boolean;
    duration: number;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
}

export interface ChatMessage {
    _id: string;
    sender: {
        _id: string;
        name: string;
        role: 'teacher' | 'student';
    };
    message: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
