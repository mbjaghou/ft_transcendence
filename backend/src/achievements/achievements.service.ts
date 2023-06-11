import { BadRequestException, Body, Injectable, Req } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { achievementDto } from './achievements.dto';

const prisma = new PrismaClient();
@Injectable()
export class AchievementsService {
	async getAchievements(@Req() req: Request) {
		const achievements = await prisma.achievement.findMany({
			where: {},
			include: {
				AchievementLog: {
					where: { User: req.user },
					select: {
						score: true,
						occuredAt: true
					}
				}
			}
		});
		const updatedAchievements = achievements.map(entry => {
			const { id, AchievementLog, ...rest } = entry;
			return {
				...rest,
				score: AchievementLog[0] ? AchievementLog[0].score : 0,
				occuredAt: AchievementLog[0] ? AchievementLog[0].occuredAt : ''
			};
		});
		return updatedAchievements;		
	}
	
	async updateAchievements(@Req() req: Request, @Body() achiev: achievementDto) {
		const achievement = await prisma.achievement.findUnique({
			where: {name: achiev.name},
			include: {AchievementLog: true}
		});
		if (!achievement)
		throw new BadRequestException('The achievement name is invalid');
		const achievementLog = await prisma.achievementLog.findFirst({
			where: { User: req.user, achievement_id: achievement.id }
		});
		const newscore: number = achievementLog?.score + 1;
		if (!newscore) {
			await prisma.achievementLog.create({
				data: {
					user_id: req.user['id'],
					achievement_id: achievement.id,
					score: 1,
					occuredAt: new Date(),
				}
			});
			if (+achievement.milestone == 1)
				return true;
			return false;
		}
		if (newscore && newscore > +achievement.milestone)
			throw new BadRequestException('This achievement has already been accomplished');
		if (achiev.reset == true) {
			await prisma.achievementLog.updateMany({
				where: { user_id: req.user['id'], achievement_id: achievement.id },
				data: { score: 0, occuredAt: new Date() }
			});
			return false;
		}
		await prisma.achievementLog.updateMany({
			where: { user_id: req.user['id'], achievement_id: achievement.id },
			data: { score: newscore, occuredAt: new Date() }
		});
		if (newscore == +achievement.milestone)
			return true;
		return false;
	}
}
