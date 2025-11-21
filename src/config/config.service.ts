import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConfig, AppConfigDocument } from './schemas/app-config.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(AppConfig.name)
    private appConfigModel: Model<AppConfigDocument>,
  ) {}

  async getConfig(): Promise<AppConfigDocument> {
    let config = await this.appConfigModel.findOne().exec();
    if (!config) {
      config = new this.appConfigModel({ requiredMissionsForFinal: 0 });
      await config.save();
    }
    return config;
  }

  async updateRequiredMissionsForFinal(
    requiredMissionsForFinal: number,
  ): Promise<AppConfigDocument> {
    let config = await this.appConfigModel.findOne().exec();
    if (!config) {
      config = new this.appConfigModel({ requiredMissionsForFinal });
    } else {
      config.requiredMissionsForFinal = requiredMissionsForFinal;
    }
    return config.save();
  }
}

