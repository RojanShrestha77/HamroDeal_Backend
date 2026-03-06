import { setupSocketHandlers, getOnlineUsers, isUserOnline } from '../../../socket/socket.handler';
import { MessageService } from '../../../services/message.service';
import { ConversationService } from '../../../services/conversation.service';

jest.mock('../../../services/message.service');
jest.mock('../../../services/conversation.service');

describe('socket.handler', () => {
    let mockIo: any;
    let mockSocket: any;
    let connectionHandler: Function;

    const userId = 'user123';

    beforeEach(() => {
        jest.clearAllMocks();

        mockSocket = {
            userId,
            id: 'socket-id-1',
            join: jest.fn(),
            emit: jest.fn(),
            disconnect: jest.fn(),
            on: jest.fn((event: string, handler: Function) => {
                mockSocket._handlers = mockSocket._handlers || {};
                mockSocket._handlers[event] = handler;
            }),
            _handlers: {} as Record<string, Function>,
        };

        mockIo = {
            on: jest.fn((event: string, handler: Function) => {
                if (event === 'connection') connectionHandler = handler;
            }),
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };
    });

    describe('setupSocketHandlers', () => {
        it('should disconnect socket with no userId', () => {
            setupSocketHandlers(mockIo);
            mockSocket.userId = undefined;
            connectionHandler(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });

        it('should join user room and emit user_online on connection', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            expect(mockSocket.join).toHaveBeenCalledWith(userId);
            expect(mockIo.emit).toHaveBeenCalledWith('user_online', { userId });
        });

        it('should register socket event handlers on connection', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            expect(mockSocket.on).toHaveBeenCalledWith('send_message', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('typing', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('stop_typing', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('mark_as_read', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('get_online_users', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        });

        it('should handle disconnect and emit user_offline', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            mockSocket._handlers['disconnect']();
            expect(mockIo.emit).toHaveBeenCalledWith('user_offline', { userId });
        });

        it('should handle get_online_users with callback', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);

            const callback = jest.fn();
            mockSocket._handlers['get_online_users'](callback);
            expect(callback).toHaveBeenCalledWith(expect.any(Array));
        });

        it('should handle get_online_users without callback (no crash)', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            expect(() => mockSocket._handlers['get_online_users'](undefined)).not.toThrow();
        });

        it('should handle typing event when receiver is online', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);

            // Put the receiver online
            const receiverSocket = {
                ...mockSocket,
                userId: 'receiver123',
                id: 'socket-id-2',
                _handlers: {},
            };
            connectionHandler(receiverSocket);

            mockSocket._handlers['typing']({ conversationId: 'conv1', receiverId: 'receiver123' });
            expect(mockIo.to).toHaveBeenCalledWith('receiver123');
            expect(mockIo.emit).toHaveBeenCalledWith(expect.stringContaining('user_typing'), expect.any(Object));
        });

        it('should handle typing event when receiver is offline (no crash)', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            expect(() =>
                mockSocket._handlers['typing']({ conversationId: 'conv1', receiverId: 'offlineUser' })
            ).not.toThrow();
        });

        it('should handle stop_typing event when receiver is online', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);

            const receiverSocket = { ...mockSocket, userId: 'receiver456', id: 'socket-id-3', _handlers: {} };
            connectionHandler(receiverSocket);

            mockSocket._handlers['stop_typing']({ conversationId: 'conv1', receiverId: 'receiver456' });
            expect(mockIo.to).toHaveBeenCalledWith('receiver456');
        });

        it('should handle send_message and call callback on success', async () => {
            const mockMessage = { _id: 'msg1' };
            const mockConversation = { otherUser: { _id: { toString: () => 'other1' } } };

            jest.spyOn(MessageService.prototype, 'sendMessage').mockResolvedValue(mockMessage as any);
            jest.spyOn(ConversationService.prototype, 'getConversationById').mockResolvedValue(mockConversation as any);
            jest.spyOn(MessageService.prototype, 'markAsDelivered').mockResolvedValue(undefined as any);

            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);

            const callback = jest.fn();
            await mockSocket._handlers['send_message']({ conversationId: 'conv1', text: 'hello' }, callback);

            expect(MessageService.prototype.sendMessage).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should handle send_message error and call callback with error', async () => {
            jest.spyOn(MessageService.prototype, 'sendMessage').mockRejectedValue(new Error('DB error'));

            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);

            const callback = jest.fn();
            await mockSocket._handlers['send_message']({ conversationId: 'conv1', text: 'hi' }, callback);

            expect(callback).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });

        it('should handle mark_as_read event', async () => {
            jest.spyOn(MessageService.prototype, 'markAsRead').mockResolvedValue(undefined as any);
            jest.spyOn(ConversationService.prototype, 'getConversationById').mockResolvedValue({
                participants: []
            } as any);

            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            await mockSocket._handlers['mark_as_read']({ conversationId: 'conv1' });
            expect(MessageService.prototype.markAsRead).toHaveBeenCalledWith('conv1', userId);
        });
    });

    describe('getOnlineUsers', () => {
        it('should return an array of user IDs', () => {
            const users = getOnlineUsers();
            expect(Array.isArray(users)).toBe(true);
        });
    });

    describe('isUserOnline', () => {
        it('should return false for an unknown userId', () => {
            expect(isUserOnline('nonexistent-user')).toBe(false);
        });

        it('should return true for a connected user', () => {
            setupSocketHandlers(mockIo);
            connectionHandler(mockSocket);
            expect(isUserOnline(userId)).toBe(true);
        });
    });
});
