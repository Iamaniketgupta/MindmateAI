import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeCookie } from "../../../utils/cookiesApi";
import toast from "react-hot-toast";
import { addUser } from "../../../../store/userSlice";
export const navItems = [
  { label: "Home", href: "/" },
  { label: "Study Buddy", href: "/mockInterview" },
  { label: "Guidance", href: "/mentors" },
  { label: "Notes Buddy", href: "/notes" },
  { label: "Communities", href: "/community" },
  // { label: "My Appointments", href: "/appointments" },
];
// import { useSelector } from "react-redux";
import Cookies from "universal-cookie";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const cookies = new Cookies();
  const currUserData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  // const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    dispatch(addUser(null));
    cookies.remove("user_token");
    navigate("/login");
  };

  console.log(currUserData);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-lg shadow-sm md:px-10 px-4 h-18 felx items-center border-neutral-700/80">
        <div className="container px-4 mx-auto relative lg:text-sm">
          <div className="flex justify-between items-center text-stone-200">
            <Link to={"/"} className="flex items-center flex-shrink-0">
              <div
                className={`text-2xl  font-bold scale-110 w-24  h-18 overflow-clip" `}
              >
                <img
                  src="/logo.png"
                  alt="logo "
                  className=" rounded-full object-cover "
                />
              </div>
            </Link>
            <ul className="hidden lg:flex ml-14 space-x-8">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    className="hover:text-gradient-secondary font-semibold"
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hidden lg:flex justify-center space-x-4 items-center">
              {currUserData ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="py-2 px-3 border rounded-md"
                  >
                    Log out
                  </button>

                  <button
                    onClick={() => {
                        navigate("/dashboard");
                    }}
                    className="py-2 px-3 border rounded-md bg-gradient-to-r from-gradient-secondary to-gradient-primary  text-white font-semibold"
                  >
                    {currUserData.name}'s Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={"/login"}
                    className=" py-2 px-3 border rounded-md glass"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    className="text-white bg-gradient-to-r glass py-2 text-md border px-3 rounded-md"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>
            <div className="lg:hidden md:flex flex-col justify-end">
              <button onClick={toggleNavbar}>
                {mobileDrawerOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          {mobileDrawerOpen && (
            <div className="fixed right-0 z-20 bg-background text-stone-300 w-full p-12 flex flex-col justify-center items-center lg:hidden">
              <ul>
                {navItems.map((item, index) => (
                  <li key={index} className="py-4">
                    <Link to={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
              <div className="flex space-x-6 flex-wrap">
                <button
                  onClick={handleLogout}
                  className="py-2 px-3 border rounded-md glass"
                >
                  Log in
                </button>
                <Link
                  to="/signup"
                  className="py-2 px-3 rounded-md hover:opacity-75  glass"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
