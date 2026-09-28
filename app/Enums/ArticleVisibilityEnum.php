<?php

namespace App\Enums;

enum ArticleVisibilityEnum: string
{
    //
    case PUBLIC = 'public';
    case MEMBERS_ONLY = 'members-only';
    case PRIVATE = 'private';

    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Public',
            self::MEMBERS_ONLY => 'Members Only',
            self::PRIVATE => 'Private',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases(),
        );
    }
}
