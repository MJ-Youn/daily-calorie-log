import React from 'react';
import {
    Utensils,
    Activity,
    Coffee,
    Beer,
    Wine,
    GlassWater, // Water, Drink
    Carrot, // Vegetable
    Beef, // Meat
    Fish, // Seafood
    IceCream, // Dessert
    Pizza,
    Sandwich,
    Dumbbell, // Weight
    Footprints, // Run/Walk
    Bike, // Cycling
    Waves, // Swimming
    type LucideIcon
} from 'lucide-react';

interface DynamicIconProps {
    type: 'FOOD' | 'EXERCISE';
    content: string;
    className?: string;
}

const FOOD_ICON_MATCHERS = [
    { regex: /커피|아메리카노|라떼|에스프레소|coffee|cafe|tea/, Icon: Coffee },
    { regex: /맥주|beer|lager|ale/, Icon: Beer },
    { regex: /와인|소주|위스키|술|wine|liquor/, Icon: Wine },
    { regex: /물|음료|주스|water|drink|juice/, Icon: GlassWater },
    { regex: /샐러드|채소|야채|salad|vegetable|carrot/, Icon: Carrot },
    { regex: /고기|스테이크|삼겹살|구이|불고기|meat|beef|pork/, Icon: Beef },
    { regex: /생선|회|초밥|스시|fish|sushi|seafood/, Icon: Fish },
    { regex: /아이스크림|디저트|케이크|초콜릿|dessert|ice|cake/, Icon: IceCream },
    { regex: /피자|pizza/, Icon: Pizza },
    { regex: /샌드위치|햄버거|버거|빵|토스트|sandwich|burger|bread/, Icon: Sandwich },
];

const EXERCISE_ICON_MATCHERS = [
    { regex: /런닝|조깅|걷기|산책|run|walk|jog/, Icon: Footprints },
    { regex: /자전거|사이클|싸이클|bike|cycle/, Icon: Bike },
    { regex: /수영|물놀이|swim|pool/, Icon: Waves },
    { regex: /웨이트|헬스|pt|근력|weight|gym|muscle/, Icon: Dumbbell },
];

/**
 * 로그 내용(content)에 따라 적절한 아이콘을 표시하는 컴포넌트입니다.
 * 키워드 매칭을 통해 아이콘을 선택하며, 매칭되는 것이 없으면 기본 아이콘을 사용합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-30
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ type, content, className }) => {
    const lowerContent = content.toLowerCase();

    let Icon: LucideIcon = type === 'FOOD' ? Utensils : Activity;

    const matchers = type === 'FOOD' ? FOOD_ICON_MATCHERS : EXERCISE_ICON_MATCHERS;
    const matcher = matchers.find(m => m.regex.test(lowerContent));

    if (matcher) {
        Icon = matcher.Icon;
    }

    return <Icon className={className} />;
};
