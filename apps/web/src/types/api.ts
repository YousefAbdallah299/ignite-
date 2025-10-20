// TypeScript definitions for Ignite Backend API

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  INTERVIEWER = 'INTERVIEWER',
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}

export enum MediaType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

// Request DTOs
export interface RegisterRequestDTO {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  newPassword: string;
  confirmPassword: string;
}

export interface JobRequestDTO {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salary: string;
  currency: string;
  categories?: string[];
}

export interface CourseRequestDTO {
  title: string;
  description: string;
  sections: CourseSectionRequestDTO[];
  categories: string[];
}

export interface CourseSectionRequestDTO {
  title: string;
  content: string;
  videoUrl: string;
  lessons: CourseLessonRequestDTO[];
}

export interface CourseLessonRequestDTO {
  title: string;
  content: string;
  videoUrl: string;
}

export interface BlogRequestDTO {
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
}

export interface SendOfferDTO {
  candidateProfileId: number;
  title: string;
  salary?: number;
  currency?: string;
}

export interface UpdateCandidateProfileDTO {
  title: string;
  summary?: string;
  resumeUrl?: string;
  availableFrom?: string; // ISO date string
}

export interface WorkshopInvitationRequestDTO {
  name: string;
  description: string;
  invitationLink: string;
  startDate: string; // ISO date string
  recipientEmails: string[];
}

// Response DTOs
export interface RegisterResponseDTO {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface LoginResponseDTO {
  token: string;
  tokenType: string;
  message: string;
  httpStatus: string;
  role: UserRole;
}

export interface JobResponseDTO {
  id: number;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  location: string;
  categories: string[];
  salary: string;
  employmentType: string;
  currency: string;
  applicationCount: number;
}

export interface CourseResponseDTO {
  id: number;
  title: string;
  description: string;
  sections: CourseSectionResponseDTO[];
  categories: string[];
}

export interface CourseSectionResponseDTO {
  id: number;
  title: string;
}

export interface CourseLessonResponseDTO {
  id: number;
  title: string;
  content: string;
  videoUrl: string;
}

export interface CourseSummaryResponseDTO {
  id: number;
  title: string;
  description: string;
  categories: string[];
  createdAt: string;
}

export interface BlogResponseDTO {
  id: number;
  userId: number;
  username: string;
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser?: boolean;
}

export interface CommentResponseDTO {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser?: boolean;
  parentId?: number;
  replies?: CommentResponseDTO[];
}

export interface LikeResponseDTO {
  id: number;
  userId: number;
  username: string;
  createdAt: string;
}

export interface OfferResponseDTO {
  id: number;
  status: OfferStatus;
  title: string;
  salary?: number;
  currency?: string;
  createdAt: string;
}

export interface CandidateProfileResponseDTO {
  id: number;
  userId: number;
  name: string;
  title: string;
  summary?: string;
  resumeUrl?: string;
  availableFrom?: string;
  skills: Record<string, number>; // skill name -> rating
}

export interface RecruiterProfileResponseDTO {
  id: number;
  userId: number;
  name: string;
  company: string;
  title: string;
  summary?: string;
  createdAt: string;
}

export interface UserSummaryDTO {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// Pagination
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// API Response types
export type ApiResponse<T> = T;
export type ApiError = {
  message: string;
  status: number;
  timestamp: string;
};

// API Client types
export interface ApiClient {
  auth: {
    register: (userData: RegisterRequestDTO) => Promise<RegisterResponseDTO>;
    login: (credentials: LoginRequestDTO) => Promise<LoginResponseDTO>;
    logout: () => Promise<void>;
    confirmEmail: (token: string) => Promise<string>;
    deleteUser: (userId: number) => Promise<void>;
    forgotPassword: (email: string) => Promise<string>;
    resetPassword: (token: string, passwordData: ChangePasswordDTO) => Promise<string>;
    refresh: () => Promise<void>;
  };
  courses: {
    getAllCourses: (page?: number, size?: number, query?: string, categories?: string[]) => Promise<PagedResponse<CourseSummaryResponseDTO>>;
    getCourseById: (id: number) => Promise<CourseResponseDTO>;
    createCourse: (courseData: CourseRequestDTO) => Promise<CourseResponseDTO>;
    deleteCourse: (id: number) => Promise<void>;
    enrollCourse: (id: number) => Promise<void>;
    cancelEnrollment: (id: number) => Promise<void>;
    getLessonsBySection: (sectionId: number) => Promise<CourseLessonResponseDTO[]>;
  };
  jobs: {
    getAllJobs: (page?: number, size?: number, query?: string, categories?: string[]) => Promise<PagedResponse<JobResponseDTO>>;
    createJob: (jobData: JobRequestDTO) => Promise<JobResponseDTO>;
    deleteJob: (id: number) => Promise<void>;
    applyForJob: (id: number) => Promise<void>;
    cancelJobApplication: (id: number) => Promise<void>;
  };
  offers: {
    sendOffer: (offerData: SendOfferDTO) => Promise<OfferResponseDTO>;
    getMyOffers: () => Promise<OfferResponseDTO[]>;
    getAllOffers: () => Promise<OfferResponseDTO[]>;
    respondToOffer: (offerId: number, status: OfferStatus) => Promise<OfferResponseDTO>;
    withdrawOffer: (offerId: number) => Promise<OfferResponseDTO>;
  };
  blogs: {
    getAllBlogs: (page?: number, size?: number) => Promise<PagedResponse<BlogResponseDTO>>;
    getBlogById: (id: number) => Promise<BlogResponseDTO>;
    getComments: (id: number, page?: number, size?: number) => Promise<PagedResponse<CommentResponseDTO>>;
    getReplies: (commentId: number, page?: number, size?: number) => Promise<PagedResponse<CommentResponseDTO>>;
    getBlogLikes: (id: number, page?: number, size?: number) => Promise<PagedResponse<LikeResponseDTO>>;
    getCommentLikes: (commentId: number, page?: number, size?: number) => Promise<PagedResponse<LikeResponseDTO>>;
    likeBlog: (id: number) => Promise<void>;
    likeComment: (commentId: number) => Promise<void>;
    createBlog: (blogData: BlogRequestDTO) => Promise<BlogResponseDTO>;
    deleteBlog: (id: number) => Promise<void>;
    addComment: (id: number, content: string, parentId?: number) => Promise<CommentResponseDTO>;
    deleteComment: (commentId: number) => Promise<void>;
  };
  candidates: {
    getAllCandidates: (page?: number, size?: number, query?: string, skills?: string[]) => Promise<PagedResponse<CandidateProfileResponseDTO>>;
    getMyProfile: () => Promise<CandidateProfileResponseDTO>;
    updateMyProfile: (profileData: UpdateCandidateProfileDTO) => Promise<CandidateProfileResponseDTO>;
    getCandidateById: (candidateId: number) => Promise<CandidateProfileResponseDTO>;
  };
  recruiters: {
    getAllRecruiters: (page?: number, size?: number, query?: string) => Promise<PagedResponse<RecruiterProfileResponseDTO>>;
  };
  workshops: {
    inviteToWorkshop: (invitationData: WorkshopInvitationRequestDTO) => Promise<string>;
  };
}
