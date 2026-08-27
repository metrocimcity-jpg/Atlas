import type { IndexNode } from "@/data/types";

export interface MetadataProvider {
  readonly id: string;
  canHandle(file: IndexNode): boolean;
  extract(file: File): Promise<Record<string, unknown>>;
}

export class ImageDimensionProvider implements MetadataProvider {
  readonly id = "image-dimensions";

  canHandle(file: IndexNode): boolean {
    return file.category === "Images" && file.nodeType === "file";
  }

  async extract(file: File): Promise<Record<string, unknown>> {
    const bitmap = await createImageBitmap(file);
    try {
      return {
        width: bitmap.width,
        height: bitmap.height,
      };
    } finally {
      bitmap.close();
    }
  }
}

export class MetadataProviderRegistry {
  private readonly providers: MetadataProvider[];

  constructor(providers: MetadataProvider[] = [new ImageDimensionProvider()]) {
    this.providers = providers;
  }

  matching(file: IndexNode): MetadataProvider[] {
    return this.providers.filter((provider) => provider.canHandle(file));
  }
}

export const defaultMetadataProviders = new MetadataProviderRegistry();
