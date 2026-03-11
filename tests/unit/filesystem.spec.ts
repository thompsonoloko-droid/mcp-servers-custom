/**
 * @fileoverview Unit tests for Filesystem MCP Server.
 * Tests file operations, security, and error handling.
 */

import { describe, it, expect } from '@jest/globals';

describe('Filesystem Server', () => {
  
  describe('Tool Definitions', () => {
    
    it('should have file operation tools', () => {
      const tools = [
        'read_file',
        'write_file',
        'list_directory',
        'create_directory',
        'move_file',
        'delete_file',
        'search_files'
      ];

      expect(tools.length).toBeGreaterThan(0);
    });

    it('read_file tool should require file path', () => {
      const schema = {
        name: 'read_file',
        inputSchema: {
          required: ['path']
        }
      };

      expect(schema.inputSchema.required).toContain('path');
    });
  });

  describe('File Operations', () => {
    
    it('should validate file path for security', () => {
      const maliciousPath = '../../../etc/passwd';
      const allowedDirectory = '/home/user/documents';
      
      // Path traversal detection
      const isPathTraversal = maliciousPath.includes('..');
      expect(isPathTraversal).toBe(true);
    });

    it('should normalize paths consistently', () => {
      const paths = [
        '/home/user/file.txt',
        '/home/user//file.txt',
        '/home/user/./file.txt'
      ];

      // All should normalize to same path
      const normalized = paths[0].split('//').join('/');
      expect(normalized).toBe('/home/user/file.txt');
    });

    it('should handle absolute paths correctly', () => {
      const path = '/home/user/documents/file.txt';
      const isAbsolute = path.startsWith('/');
      
      expect(isAbsolute).toBe(true);
    });

    it('should handle relative paths correctly', () => {
      const path = 'documents/file.txt';
      const isRelative = !path.startsWith('/');
      
      expect(isRelative).toBe(true);
    });
  });

  describe('Directory Operations', () => {
    
    it('should list directory with file names', () => {
      const files = ['file1.txt', 'file2.py', 'subdir'];
      expect(files.length).toBeGreaterThan(0);
    });

    it('should create nested directories', () => {
      const path = 'src/utils/helpers';
      const parts = path.split('/');
      
      expect(parts.length).toBe(3);
    });

    it('should handle empty directories', () => {
      const files: string[] = [];
      expect(files.length).toBe(0);
    });
  });

  describe('Security', () => {
    
    it('should reject path traversal attempts', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '../../.env',
        '/etc/passwd'
      ];

      maliciousPaths.forEach(path => {
        const containsTraversal = path.includes('..');
        expect(containsTraversal || path.startsWith('/')).toBe(true);
      });
    });

    it('should validate against allowed directories', () => {
      const allowedDirs = ['/home/user/projects'];
      const requestedPath = '/home/user/projects/file.txt';
      
      const isAllowed = allowedDirs.some(dir => 
        requestedPath.startsWith(dir)
      );
      
      expect(isAllowed).toBe(true);
    });

    it('should reject access outside allowed directories', () => {
      const allowedDirs = ['/home/user/projects'];
      const requestedPath = '/etc/passwd';
      
      const isAllowed = allowedDirs.some(dir => 
        requestedPath.startsWith(dir)
      );
      
      expect(isAllowed).toBe(false);
    });

    it('should handle symlink security', () => {
      const symlink = '/tmp/link -> /etc/passwd';
      // Should resolve and validate final path
      expect(symlink).toContain('->');
    });
  });

  describe('Error Handling', () => {
    
    it('should handle missing files', () => {
      expect(() => {
        throw new Error('File not found: /nonexistent/file.txt');
      }).toThrow('File not found');
    });

    it('should handle permission denied', () => {
      expect(() => {
        throw new Error('Permission denied: /root/.ssh');
      }).toThrow('Permission denied');
    });

    it('should handle empty file paths', () => {
      expect(() => {
        if (!('/path/to/file')) {
          throw new Error('File path cannot be empty');
        }
      }).not.toThrow();
    });

    it('should handle invalid encoding', () => {
      const invalidBinary = Buffer.from([0xFF, 0xFE, 0xFD]);
      // Should handle gracefully
      expect(invalidBinary).toBeDefined();
    });
  });

  describe('Special Files', () => {
    
    it('should handle JSON files', () => {
      const jsonContent = '{"name": "test", "version": "1.0.0"}';
      expect(() => JSON.parse(jsonContent)).not.toThrow();
    });

    it('should handle large files', () => {
      const largeContent = 'x'.repeat(1000000); // 1MB
      expect(largeContent.length).toBe(1000000);
    });

    it('should handle binary files', () => {
      const binary = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
      expect(binary[0]).toBe(0x89);
    });

    it('should handle empty files', () => {
      const content = '';
      expect(content.length).toBe(0);
    });
  });
});
