import { RequestStatus } from "@/interfaces/request";
import { getStatusColor, getStatusMetadata } from "@/utils/request";
import { Badge, BadgeProps, Tooltip } from "@mantine/core";

interface StatusBadgeProps extends Omit<BadgeProps, 'color'> {
    status: RequestStatus;
    showLabel?: boolean;
}

/**
 * 요청 상태를 시각적으로 표시하는 배지 컴포넌트
 * 
 * @param {StatusBadgeProps} props - 컴포넌트 속성
 * @param {RequestStatus|string} props.status - 요청 상태 코드
 * @param {boolean} [props.showLabel=true] - 레이블 표시 여부
 * @returns {JSX.Element} 상태 배지 컴포넌트
 * 
 * @example
 * <StatusBadge status="REGISTERED" />
 * <StatusBadge status="IN_PROGRESS" size="lg" />
 */
export default function StatusBadge({
    status,
    showLabel = true,
    ...badgeProps
}: StatusBadgeProps) {
    const color = getStatusColor(status);
    const label = showLabel ? getStatusMetadata(status)?.label : status;

    return (
        <Tooltip label={label}>
            <Badge
                color={color}
                variant="filled"
                {...badgeProps}
            >
                {label}
            </Badge>
        </Tooltip>
    );
}