import { prepareUploadImage } from './image-upload';

describe('optimización de fotos al subir', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('reduce fotos grandes antes de subirlas y libera la URL temporal', async () => {
    const compressed = new Blob(['small'], { type: 'image/webp' });
    const canvas = { width: 0, height: 0, getContext: () => ({ drawImage: vi.fn() }), toBlob: (done: BlobCallback) => done(compressed) };
    vi.stubGlobal('Image', class { naturalWidth = 3000; naturalHeight = 4000; decode = async () => {}; });
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() });
    vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLCanvasElement);
    const file = new File(['original-large-image'], 'foto.png', { type: 'image/png' });
    expect(await prepareUploadImage(file)).toBe(compressed);
    expect([canvas.width, canvas.height]).toEqual([1200, 1600]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('conserva el original si el navegador no puede convertirlo', async () => {
    vi.stubGlobal('Image', class { decode = async () => { throw new Error('No disponible'); }; });
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() });
    const file = new File(['image'], 'foto.jpg', { type: 'image/jpeg' });
    expect(await prepareUploadImage(file)).toBe(file);
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce();
  });
});
