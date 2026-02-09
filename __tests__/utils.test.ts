// __tests__/utils.test.ts
import { cn } from '@/lib/utils';

describe('cn utility', () => {
    it('should merge classes correctly', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
        expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    });

    it('should merge tailwind classes correctly', () => {
        expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
    });
});
