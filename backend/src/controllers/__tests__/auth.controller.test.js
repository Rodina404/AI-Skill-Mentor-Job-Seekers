process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const { supabase, supabaseAdmin } = require('../../config/supabase');
const { logout } = require('../auth.controller');

jest.mock('../../config/supabase', () => {
  return {
    supabase: {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null })
      }
    },
    supabaseAdmin: {
      auth: {
        admin: {
          signOut: jest.fn().mockResolvedValue({ error: null })
        }
      }
    }
  };
});

describe('auth.controller - logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls supabaseAdmin.auth.admin.signOut with token extracted from Authorization header', async () => {
    const req = {
      headers: {
        authorization: 'Bearer sample-access-token-123'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await logout(req, res);

    expect(supabaseAdmin.auth.admin.signOut).toHaveBeenCalledWith('sample-access-token-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });

  test('calls supabaseAdmin.auth.admin.signOut with req.token if attached by auth middleware', async () => {
    const req = {
      token: 'token-from-req-object',
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await logout(req, res);

    expect(supabaseAdmin.auth.admin.signOut).toHaveBeenCalledWith('token-from-req-object');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });

  test('returns 400 error when supabaseAdmin.auth.admin.signOut fails', async () => {
    supabaseAdmin.auth.admin.signOut.mockResolvedValueOnce({
      error: { message: 'Invalid token or session expired' }
    });

    const req = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await logout(req, res);

    expect(supabaseAdmin.auth.admin.signOut).toHaveBeenCalledWith('invalid-token');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token or session expired' });
  });
});
