import { ConversationService } from '../../../services/conversation.service';
import { ConversationRepository } from '../../../repositories/conversation.repository';
import { HttpError } from '../../../errors/http-error';
import mongoose from 'mongoose';

// Mock the repository
jest.mock('../../../repositories/conversation.repository');

describe('ConversationService', () => {
    let conversationService: ConversationService;
    let mockConversationRepo: jest.Mocked<ConversationRepository>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset the singleton instance or mock implementation
        conversationService = new ConversationService();

        // Access the instantiated repo (which is mocked) via prototype or as a cast if needed. 
        // Since conversationRepo is instantiated globally in conversation.service.ts, 
        // mocking the class prototype methods is effective. Let's mock the methods on the instance.
        mockConversationRepo = (ConversationRepository as any).mock.instances[0] || new ConversationRepository();

        // We'll mock the methods directly on the ConversationRepository prototype
        jest.spyOn(ConversationRepository.prototype, 'findByParticipants').mockImplementation();
        jest.spyOn(ConversationRepository.prototype, 'create').mockImplementation();
        jest.spyOn(ConversationRepository.prototype, 'findById').mockImplementation();
        jest.spyOn(ConversationRepository.prototype, 'findByUserId').mockImplementation();
        jest.spyOn(ConversationRepository.prototype, 'delete').mockImplementation();
        jest.spyOn(ConversationRepository.prototype, 'resetUnreadCount').mockImplementation();
    });

    const validId1 = new mongoose.Types.ObjectId().toString();
    const validId2 = new mongoose.Types.ObjectId().toString();
    const invalidId = 'invalid-id';

    describe('createOrGetConversation', () => {
        it('should throw 400 if user ID is invalid', async () => {
            await expect(conversationService.createOrGetConversation(invalidId, validId2)).rejects.toThrow(HttpError);
        });

        it('should throw 400 if otherUser ID is invalid', async () => {
            await expect(conversationService.createOrGetConversation(validId1, invalidId)).rejects.toThrow(HttpError);
        });

        it('should throw 400 if userId equals otherUserId', async () => {
            await expect(conversationService.createOrGetConversation(validId1, validId1)).rejects.toThrow(HttpError);
        });

        it('should return existing conversation format if found', async () => {
            const mockConversation = {
                _id: new mongoose.Types.ObjectId(),
                participants: [{ _id: validId1 }, { _id: validId2 }],
                lastMessage: 'hello',
                unreadCount: new Map([[validId1, 2]]),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            jest.spyOn(ConversationRepository.prototype, 'findByParticipants').mockResolvedValue(mockConversation as any);

            const result = await conversationService.createOrGetConversation(validId1, validId2);
            expect(result).toHaveProperty('_id', mockConversation._id);
            expect(result).toHaveProperty('otherUser._id', validId2);
        });

        it('should create new conversation if not found', async () => {
            jest.spyOn(ConversationRepository.prototype, 'findByParticipants').mockResolvedValue(null);

            const mockNewConversation = {
                _id: new mongoose.Types.ObjectId(),
                participants: [validId1, validId2],
                lastMessage: null,
                unreadCount: new Map(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            jest.spyOn(ConversationRepository.prototype, 'create').mockResolvedValue(mockNewConversation as any);

            const result = await conversationService.createOrGetConversation(validId1, validId2);
            expect(ConversationRepository.prototype.create).toHaveBeenCalledWith([validId1, validId2]);
            expect(result).toHaveProperty('_id', mockNewConversation._id);
            expect(result).toHaveProperty('otherUser', validId2);
        });
    });

    describe('getConversationById', () => {
        const convoId = new mongoose.Types.ObjectId().toString();

        it('should throw 400 if conversationId is invalid', async () => {
            await expect(conversationService.getConversationById(invalidId, validId1)).rejects.toThrow(HttpError);
        });

        it('should throw 404 if conversation not found', async () => {
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(null);
            await expect(conversationService.getConversationById(convoId, validId1)).rejects.toThrow(HttpError);
        });

        it('should throw 403 if user is not a participant', async () => {
            const mockConvo = { participants: [validId2] };
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(mockConvo as any);
            await expect(conversationService.getConversationById(convoId, validId1)).rejects.toThrow(HttpError);
        });

        it('should return conversation if user is participant', async () => {
            const mockConvo = {
                _id: convoId,
                participants: [validId1, validId2],
                unreadCount: new Map(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(mockConvo as any);

            const result = await conversationService.getConversationById(convoId, validId1);
            expect(result).toHaveProperty('_id', convoId);
        });
    });

    describe('getUserConversations', () => {
        it('should throw 400 if userId is invalid', async () => {
            await expect(conversationService.getUserConversations(invalidId)).rejects.toThrow(HttpError);
        });

        it('should return formatted conversations array', async () => {
            const mockData = {
                conversations: [{
                    _id: new mongoose.Types.ObjectId(),
                    participants: [{ _id: validId1 }, { _id: validId2 }],
                    unreadCount: new Map(),
                }],
                total: 1
            };
            jest.spyOn(ConversationRepository.prototype, 'findByUserId').mockResolvedValue(mockData as any);

            const result = await conversationService.getUserConversations(validId1, 1, 10);
            expect(result.conversations).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('deleteConversation', () => {
        const convoId = new mongoose.Types.ObjectId().toString();

        it('should throw 400 if invalid conversationId', async () => {
            await expect(conversationService.deleteConversation(invalidId, validId1)).rejects.toThrow(HttpError);
        });

        it('should throw 404 if not found', async () => {
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(null);
            await expect(conversationService.deleteConversation(convoId, validId1)).rejects.toThrow(HttpError);
        });

        it('should throw 403 if user is not participant', async () => {
            const mockConvo = { participants: [validId2] };
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(mockConvo as any);
            await expect(conversationService.deleteConversation(convoId, validId1)).rejects.toThrow(HttpError);
        });

        it('should call delete method on repo if authorized', async () => {
            const mockConvo = { participants: [validId1] };
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(mockConvo as any);
            await conversationService.deleteConversation(convoId, validId1);
            expect(ConversationRepository.prototype.delete).toHaveBeenCalledWith(convoId);
        });
    });

    describe('resetUnreadCount', () => {
        const convoId = new mongoose.Types.ObjectId().toString();

        it('should throw 400 if invalid conversationId', async () => {
            await expect(conversationService.resetUnreadCount(invalidId, validId1)).rejects.toThrow(HttpError);
        });

        it('should throw 404 if not found', async () => {
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(null);
            await expect(conversationService.resetUnreadCount(convoId, validId1)).rejects.toThrow(HttpError);
        });

        it('should throw 403 if user is not participant', async () => {
            const mockConvo = { participants: [validId2] };
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(mockConvo as any);
            await expect(conversationService.resetUnreadCount(convoId, validId1)).rejects.toThrow(HttpError);
        });

        it('should call resetUnreadCount method on repo if authorized', async () => {
            const mockConvo = { participants: [validId1] };
            jest.spyOn(ConversationRepository.prototype, 'findById').mockResolvedValue(mockConvo as any);
            await conversationService.resetUnreadCount(convoId, validId1);
            expect(ConversationRepository.prototype.resetUnreadCount).toHaveBeenCalledWith(convoId, validId1);
        });
    });
});
