import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PlotFacing, PlotStatus } from '@prisma/client';

const plotFacingEnum = z.nativeEnum(PlotFacing);
const plotStatusEnum = z.nativeEnum(PlotStatus);

/** Fields a client may set when creating a plot. org comes from auth. */
export const createPlotSchema = z.object({
  projectId: z.string().uuid(),
  plotNumber: z.string().trim().min(1, 'Plot number is required').max(60),
  areaSqft: z.coerce.number().nonnegative(),
  pricePerSqft: z.coerce.number().nonnegative().optional(),
  totalPrice: z.coerce.number().nonnegative(),
  facing: plotFacingEnum.optional(),
  status: plotStatusEnum.default(PlotStatus.available),
  block: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(5000).optional(),
  reservedFor: z.string().uuid().optional(),
});

export const updatePlotSchema = createPlotSchema.partial();

export const listPlotsQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: plotStatusEnum.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export class CreatePlotDto extends createZodDto(createPlotSchema) {}
export class UpdatePlotDto extends createZodDto(updatePlotSchema) {}
export class ListPlotsQueryDto extends createZodDto(listPlotsQuerySchema) {}
