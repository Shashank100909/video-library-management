import {IsNotEmpty, IsString, IsInt, Min, min } from 'class-validator'

export class CreateVideoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsInt()
    @Min(1)
    totalCopies: number;
}