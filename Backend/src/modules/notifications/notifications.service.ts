import { Injectable } from '@nestjs/common';
import { FollowupStatus, PaymentStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../auth/auth-user.interface';

export interface NotificationItem {
  type: 'follow_up' | 'payment' | 'task';
  title: string;
  date: string | null;
  href: string;
}

/** Computed reminders (no table): due follow-ups, overdue payments, open tasks. */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async forUser(user: AuthUser): Promise<{ count: number; items: NotificationItem[] }> {
    const now = new Date();

    const [followUps, payments, tasks] = await this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where: {
          orgId: user.orgId,
          assignedTo: user.id,
          status: FollowupStatus.pending,
          dueAt: { lte: now },
        },
        orderBy: { dueAt: 'asc' },
        take: 20,
      }),
      this.prisma.payment.findMany({
        where: {
          orgId: user.orgId,
          status: { in: [PaymentStatus.due, PaymentStatus.overdue] },
        },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
      this.prisma.task.findMany({
        where: {
          orgId: user.orgId,
          assignedTo: user.id,
          status: { in: [TaskStatus.open, TaskStatus.in_progress] },
          dueAt: { lte: now },
        },
        orderBy: { dueAt: 'asc' },
        take: 20,
      }),
    ]);

    const items: NotificationItem[] = [
      ...followUps.map((f) => ({
        type: 'follow_up' as const,
        title: 'Follow-up due',
        date: f.dueAt.toISOString(),
        href: `/app/follow-ups/${f.id}`,
      })),
      ...payments.map((p) => ({
        type: 'payment' as const,
        title: 'Payment due / overdue',
        date: p.dueDate ? p.dueDate.toISOString() : null,
        href: `/app/payments/${p.id}`,
      })),
      ...tasks.map((t) => ({
        type: 'task' as const,
        title: t.title,
        date: t.dueAt ? t.dueAt.toISOString() : null,
        href: `/app/tasks/${t.id}`,
      })),
    ];

    return { count: items.length, items };
  }
}
