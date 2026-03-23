import React from "react";

const Certificate = ({ name, course, score }) => {
  return (
    <div className="p-10 border text-center">
      <h1 className="text-4xl font-bold mb-6">Certificate</h1>

      <p>This certifies that</p>
      <h2 className="text-2xl font-bold my-4">{name}</h2>

      <p>has successfully completed</p>
      <h3 className="text-xl font-semibold">{course}</h3>

      <p className="mt-4">Score: {score}</p>

      <p className="mt-10">Date: {new Date().toLocaleDateString()}</p>
    </div>
  );
};

export default Certificate;