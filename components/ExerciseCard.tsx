import Image from "next/image";
export default function ExerciseCard() {
  return (
    <div className="m-4 p-2 flex flex-col w-48 h-64">
      <div className="">
        <Image src="globe.svg" alt="Image" />
      </div>
      <div className=""></div>
    </div>
  );
}
