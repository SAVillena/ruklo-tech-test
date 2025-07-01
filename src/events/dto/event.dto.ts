import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class EventDto {
  @IsString()
  client_id: string;

  @IsString()
  store_id: string;

  @IsEnum(['visit', 'recharge'])
  type: 'visit' | 'recharge';

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsDateString()
  timestamp: string;
}
