import { Trip2TalkHeroPreview } from "./Trip2TalkHeroPreview";
import { TripChatPanel } from "./TripChatPanel";

export function CtaDashboardMock() {
  return (
    <div className="liquid-glass mx-auto aspect-[3/4] w-full max-w-[1100px] overflow-hidden rounded-2xl p-2 sm:aspect-[16/10] sm:p-3 lg:aspect-[16/9]">
      <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,320px)_1fr] sm:gap-3">
        <div className="hidden min-h-0 sm:block">
          <TripChatPanel initialScroll="top" animateMessagesIn />
        </div>
        <div className="min-h-0">
          <Trip2TalkHeroPreview />
        </div>
      </div>
    </div>
  );
}
